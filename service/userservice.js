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
    const roleNames =
      Array.isArray(user.roles) && user.roles.length > 0 ? user.roles : ["student"];
    const uniqueRoleNames = Array.from(new Set(roleNames));

    const roles = await Role.findAll({
      where: { name: uniqueRoleNames },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (roles.length !== uniqueRoleNames.length) {
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

    const userRoleRows = roles.map((r) => ({ userId: newUser.id, roleId: r.id }));
    await UserRole.bulkCreate(userRoleRows, { transaction: t });

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


const updateProfileAsync = async (id, user) => {
  const payload = { ...user };
  const roleNames =
    Array.isArray(payload.roles) && payload.roles.length > 0 ? payload.roles : undefined;
  delete payload.roles;

  if (payload.gender !== undefined) {
    const genderMap = {
      0: "other",
      1: "male",
      2: "female",
    };
    if (typeof payload.gender === "number") {
      payload.gender = genderMap[payload.gender];
    }

    const allowed = ["male", "female", "other", null];
    if (!allowed.includes(payload.gender)) {
      throw new UserFriendlyException("Invalid gender value");
    }
  }

  const hasProfileFields = Object.keys(payload).length > 0;

  return User.sequelize.transaction(async (t) => {
    if (roleNames) {
      const uniqueRoleNames = Array.from(new Set(roleNames));
      const roles = await Role.findAll({
        where: { name: uniqueRoleNames },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (roles.length !== uniqueRoleNames.length) {
        throw new EntityNotFoundException("role not found");
      }

      if (hasProfileFields) {
        const [affectedCount] = await User.update(payload, {
          where: { id },
          transaction: t,
        });
        if (affectedCount === 0) {
          throw new UserFriendlyException("User not found or no changes made");
        }
      } else {
        const exists = await User.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });
        if (!exists) {
          throw new UserFriendlyException("User not found or no changes made");
        }
      }

      await UserRole.destroy({ where: { userId: id }, transaction: t });
      const rows = roles.map((r) => ({ userId: id, roleId: r.id }));
      await UserRole.bulkCreate(rows, { transaction: t });
    } else {
      if (hasProfileFields) {
        const [affectedCount] = await User.update(payload, {
          where: { id },
          transaction: t,
        });
        if (affectedCount === 0) {
          throw new UserFriendlyException("User not found or no changes made");
        }
      } else {
        throw new UserFriendlyException("No changes made");
      }
    }

    return { isSuccess: true, message: "" };
  });
};

const getUserRoleMetaAsync = async (id) => {
  const user = await User.findByPk(id, {
    attributes: ["id"],
    include: [
      {
        model: Role,
        as: "roles",
        attributes: ["name"],
        through: { attributes: [] },
      },
    ],
  });

  if (!user) return { exists: false, roles: [] };
  const roleNames =
    user.roles?.map((r) => (typeof r.name === "string" ? r.name.trim().toLowerCase() : "")) || [];

  return { exists: true, roles: roleNames.filter(Boolean) };
};

module.exports = {
  getUserbyNameAsync,
  addUserAsync,
  getUserListAsync,
  delUserByIdAsync,
  uptUserByIdAsync,
  checkUserNameAsync,
  getUserbyIdAsync,
  updateProfileAsync,
  getUserRoleMetaAsync,
};
