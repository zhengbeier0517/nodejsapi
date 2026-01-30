const { User, Role, UserRole, Menu, RoleMenu } = require("../models/index.js");
const {
  EntityAlreadyExistsException,
  EntityNotFoundException,
  UserFriendlyException,
} = require("../common/commonError.js");

const getUserbyNameAsync = async (userName) => {
  const user = await User.findOne({
    where: { userName },
    attributes: [
      "id",
      "userName",
      "email",
      "password",
      "firstName",
      "lastName",
      "phone",
      "address",
      "gender",
      "dob",
      "avatar",
      "bio",
      "createdAt",
      "updatedAt",
    ],
    include: [
      {
        model: Role,
        as: "roles",
        attributes: ["name"],
        through: { attributes: [] },
      },
    ],
  });

  return {
    isSuccess: !!user,
    message: user ? "" : "user not found",
    data: user,
  };
};

const addUserAsync = async (user) => {
  const t = await User.sequelize.transaction();
  try {
    const roleName = user.role || "student";
    const role = await Role.findOne({
      where: { name: roleName },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!role) {
      throw new EntityNotFoundException("role not found");
    }

    const newUser = await User.create(
      {
        userName: user.userName,
        password: user.password,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        address: user.address,
        gender: user.gender,
        dob: user.dob,
        avatar: user.avatar,
        bio: user.bio,
      },
      { transaction: t }
    );

    await UserRole.create(
      { userId: newUser.id, roleId: role.id },
      { transaction: t }
    );

    await t.commit();
    return { isSuccess: true, message: "", data: { id: newUser.id } };
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

const getUserListAsync = async (page, pageSize) => {
  const offset = (page - 1) * pageSize;
  const { count, rows } = await User.findAndCountAll({
    limit: pageSize,
    offset,
    attributes: [
      "id",
      "userName",
      "email",
      "firstName",
      "lastName",
      "phone",
      "address",
      "gender",
      "dob",
      "avatar",
      "bio",
      "createdAt",
      "updatedAt",
    ],
    include: [
      {
        model: Role,
        as: "roles",
        attributes: ["name"],
        through: { attributes: [] },
      },
    ],
    order: [["id", "ASC"]],
  });

  const items = rows.map((u) => ({
    ...u.get({ plain: true }),
    roles: u.roles?.map((r) => r.name) || [],
  }));

  return { isSuccess: true, message: "", data: { items, total: count } };
};

const delUserByIdAsync = async (idsString) => {
  const ids = String(idsString || "")
    .split(",")
    .map((id) => parseInt(id.trim(), 10))
    .filter((id) => Number.isInteger(id) && id > 0);

  if (ids.length === 0) {
    return { isSuccess: false, message: "no valid ids" };
  }

  const deleted = await User.sequelize.transaction(async (t) => {
    // clear role mappings explicitly (in case FK cascade differs across envs)
    await UserRole.destroy({ where: { userId: ids }, transaction: t });
    return User.destroy({ where: { id: ids }, transaction: t });
  });

  return { isSuccess: deleted > 0, message: "" };
};


const uptUserByIdAsync = async (user) => {
  const { id, ...payload } = user;
  const [affected] = await User.update(payload, { where: { id } });
  return { isSuccess: affected > 0, mesage: "" };
};

const checkUserNameAsync = async (userName, id) => {
  const user = await User.findOne({
    where: { userName },
    attributes: ["id", "userName", "email"],
  });

  if (user && user.id !== id) {
    throw new EntityAlreadyExistsException("username already exists");
  }

  return { isSuccess: true, message: "", data: user };
};

const getUserbyIdAsync = async (id) => {
  const user = await User.findByPk(id, {
    attributes: [
      "id",
      "userName",
      "email",
      "firstName",
      "lastName",
      "phone",
      "address",
      "gender",
      "dob",
      "avatar",
      "bio",
      "createdAt",
      "updatedAt",
    ],
    include: [
      {
        model: Role,
        as: "roles",
        attributes: ["name"],
        through: { attributes: [] },
      },
    ],
  });

  return { isSuccess: !!user, message: user ? "" : "user not found", data: user };
};

const getCurrentUserPermissListAsync = async (id) => {
  const user = await User.findByPk(id, {
    include: [
      {
        model: Role,
        as: "roles",
      },
    ],
  });

  if (!user) {
    throw new EntityNotFoundException("user not found");
  }

  if (user.roles && user.roles.length > 0) {
    const roleIds = user.roles.map((role) => role.id);
    const menus = await RoleMenu.findAll({
      where: {
        roleId: roleIds,
      },
      include: [
        {
          model: Menu,
          as: "menus",
        },
      ],
    });
    let menusList = [];
    if (menus && menus.length > 0) {
      menusList = menus.map((menu) => ({
        id: menu.menus.id,
        title: menu.menus.title,
        permission:
          menu.menus.permission == undefined || menu.menus.permission == null
            ? ""
            : menu.menus.permission,
        parentId: menu.menus.parentId,
        route: menu.menus.route,
        componentPath: menu.menus.componentPath,
        orderNum: menu.menus.orderNum,
        httpUrl: menu.menus.httpUrl,
        httpMethod: menu.menus.httpMethod,
        children: [],
      }));
    }

    let rootMenuTree = [];
    menusList.forEach((menu) => {
      if (
        menu.parentId == 0 ||
        menu.parentId == null ||
        menu.parentId == undefined
      ) {
        if (!rootMenuTree.some((x) => x.id == menu.id)) {
          rootMenuTree.push({
            id: menu.id,
            title: menu.title,
            parentId: menu.parentId,
            route: menu.route,
            componentPath: menu.componentPath,
            orderNum: menu.orderNum,
            httpUrl: menu.httpUrl,
            httpMethod: menu.httpMethod,
            children: [],
          });
        }
      }
    });

    for (let i = 0; i < rootMenuTree.length; i++) {
      buildMenuTree(menusList, rootMenuTree[i]);
    }

    return { isSuccess: true, message: "", data: { menus: rootMenuTree } };
  }

  return { isSuccess: true, message: "", data: [] };
};

const buildMenuTree = (menus, parentMenu) => {
  let childList = menus.filter((menu) => menu.parentId == parentMenu.id); //找到子菜单
  if (childList.length > 0) {
    childList.forEach((child) => {
      buildMenuTree(menus, child);
      if (!parentMenu.children.some((x) => x.id == child.id)) {
        parentMenu.children.push(child);
      }
    });
  }
};

const updateProfileAsync = async (id, user) => {
  if (user.gender !== undefined) {
    const genderMap = {
      0: "other",
      1: "male",
      2: "female",
    };
    if (typeof user.gender === "number") {
      user.gender = genderMap[user.gender];
    }

    const allowed = ["male", "female", "other", null];
    if (!allowed.includes(user.gender)) {
      throw new UserFriendlyException("Invalid gender value");
    }
  }

  const [affectedCount] = await User.update(user, {
    where: { id: id },
  });

  if (affectedCount === 0) {
    throw new UserFriendlyException("User not found or no changes made");
  }

  return { isSuccess: true, message: "" };
};

module.exports = {
  getUserbyNameAsync,
  addUserAsync,
  getUserListAsync,
  delUserByIdAsync,
  uptUserByIdAsync,
  checkUserNameAsync,
  getUserbyIdAsync,
  getCurrentUserPermissListAsync,
  updateProfileAsync,
};
