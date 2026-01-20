const userservice = require("../service/userService");
const authService = require("../service/authService");
const { User, Role } = require("../models");

const isAdmin = (req) => {
  const roles = req.user?.roles || [];
  return roles.includes("admin") || roles.includes("super admin");
};

const getTargetUserMeta = async (id) => {
  const user = await User.findByPk(id, {
    include: [
      {
        model: Role,
        as: "roles",
        attributes: ["name"],
        through: { attributes: [] },
      },
    ],
  });

  if (!user) return { exists: false };

  const roleNames = user.roles?.map((r) => r.name) || [];
  return {
    exists: true,
    isStudent: roleNames.includes("student"),
  };
};

/**
 * for login (no implementation yet).
 */
const loginAsync = async (req, res, next) => {
  try {
    const { userName, password } = req.body;
    const result = await authService.login({ userName, password });

    if (result.isSuccess) {
      return res.sendCommonValue(200, result.message, result.data);
    }
    return res.sendCommonValue(400, result.message);
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new user.
 */
const addUserAsync = async (req, res, next) => {
  try {
    if (!isAdmin(req)) {
      return res.sendCommonValue(403, "Only admin can create users");
    }

    const user = {
      userName: req.body.userName,
      password: req.body.password,
      email: req.body.email,
      address: req.body.address,
      age: req.body.age,
      gender: req.body.gender,
    };
    const result = await userservice.addUserAsync(user);
    if (result.isSuccess) {
      res.sendCommonValue(200, "success");
    } else {
      res.sendCommonValue(400, "add user failed");
    }
  } catch (err) {
    next(err);
  }
};

/**
 * Fetch single user profile by id.
 */
const getProfileAsync = async (req, res, next) => {
  try {
    const { idOrName } = req.params;
    const requesterId = req.user?.id;

    // If path param is numeric id, enforce self-access for non-admin.
    const isNumericId =
      typeof idOrName === "string" &&
      idOrName.trim() !== "" &&
      !Number.isNaN(Number(idOrName));

    if (isNumericId && !isAdmin(req) && Number(idOrName) !== requesterId) {
      return res.sendCommonValue(403, "Forbidden");
    }

    // If admin, allow but only for student targets
    if (isNumericId && isAdmin(req)) {
      const meta = await getTargetUserMeta(Number(idOrName));
      if (!meta.exists) {
        return res.sendCommonValue(404, "user not found");
      }
      if (!meta.isStudent) {
        return res.sendCommonValue(403, "Admin can only manage students");
      }
    }

    const result = isNumericId
      ? await userservice.getUserbyIdAsync(idOrName)
      : await userservice.getUserbyNameAsync(idOrName);

    res.sendCommonValue(200, "success", result.data);
  } catch (err) {
    next(err);
  }
};

/**
 * Delete one or more users by id list.
 */
const delUserAsync = async (req, res, next) => {
  try {
    const { ids } = req.params;
    if (!isAdmin(req)) {
      return res.sendCommonValue(403, "Only admin can delete users");
    }

    // Admin can only delete students
    const idList = ids.split(",").map((id) => Number(id));
    for (const id of idList) {
      const meta = await getTargetUserMeta(id);
      if (!meta.exists) {
        return res.sendCommonValue(404, "user not found");
      }
      if (!meta.isStudent) {
        return res.sendCommonValue(403, "Admin can only manage students");
      }
    }

    const result = await userservice.delUserByIdAsync(ids);
    if (result.isSuccess) {
      res.sendCommonValue(200, "success");
    } else {
      res.sendCommonValue(404, "user not found");
    }
  } catch (err) {
    next(err);
  }
};

/**
 * Update basic user fields (no password currently).
 */
const updateProfileAsync = async (req, res, next) => {
  try {
    const { id } = req.params;
    const requesterId = req.user?.id;
    const admin = isAdmin(req);

    if (!admin && Number(id) !== requesterId) {
      return res.sendCommonValue(403, "Forbidden");
    }

    if (admin) {
      const meta = await getTargetUserMeta(Number(id));
      if (!meta.exists) {
        return res.sendCommonValue(404, "user not found");
      }
      if (!meta.isStudent) {
        return res.sendCommonValue(403, "Admin can only manage students");
      }
    }

    const payload = {
      userName: req.body.userName,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      gender: req.body.gender,
      age: req.body.age,
      avatar: req.body.avatar,
    };
    const result = await userservice.updateProfileAsync(id, payload);
    if (result.isSuccess) {
      res.sendCommonValue(200, "success");
    } else {
      res.sendCommonValue(400, "update failed");
    }
  } catch (err) {
    next(err);
  }
};

/**
 * Simple paged list.
 */
const listAsync = async (req, res, next) => {
  try {
    if (!isAdmin(req)) {
      return res.sendCommonValue(403, "Only admin can list users");
    }

    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;
    const result = await userservice.getUserListAsync(page, pageSize);
    res.sendCommonValue(200, "success", result.data);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  loginAsync,
  addUserAsync,
  getProfileAsync,
  delUserAsync,
  updateProfileAsync,
  listAsync,
};
