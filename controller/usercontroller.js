const userService = require("../service/userService");
const bcrypt = require("bcryptjs");
const { bcryptConfig } = require("../appConfig");
const saltRounds = bcryptConfig?.saltRounds || 10;

const normalizeRoleName = (name) =>
  typeof name === "string" ? name.trim().toLowerCase() : "";

const getRoleContext = (req) => {
  const roles = (req.user?.roles || []).map(normalizeRoleName).filter(Boolean);
  const isSuperAdmin = roles.includes("super admin");
  const isAdmin = isSuperAdmin || roles.includes("admin");
  const allowedManagedRoles = isSuperAdmin
    ? ["admin", "teacher", "student"]
    : isAdmin
    ? ["teacher", "student"]
    : [];

  return { roles, isAdmin, isSuperAdmin, allowedManagedRoles };
};

const canManageTargetRoles = (allowedRoles, targetRoles) =>
  targetRoles.length > 0 && targetRoles.every((r) => allowedRoles.includes(r));

const getTargetUserMeta = async (id) => {
  const meta = await userService.getUserRoleMetaAsync(id);
  return {
    exists: meta.exists,
    roles: (meta.roles || []).map(normalizeRoleName),
  };
};

/**
 * Create a new user.
  */
const addUserAsync = async (req, res, next) => {
  try {
    const roleCtx = getRoleContext(req);
    if (!roleCtx.isAdmin) {
      return res.sendCommonValue(403, "Only admin or super admin can create users");
    }

    const roleName = normalizeRoleName(req.body.role) || "student";
    if (!roleCtx.allowedManagedRoles.includes(roleName)) {
      return res.sendCommonValue(403, "Insufficient permission for this role");
    }

    const user = {
      userName: req.body.userName,
      password: await bcrypt.hash(req.body.password, saltRounds),
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
      address: req.body.address,
      gender: req.body.gender,
      dob: req.body.dob,
      avatar: req.body.avatar,
      bio: req.body.bio,
      role: roleName,
    };
    const result = await userService.addUserAsync(user);
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
    const roleCtx = getRoleContext(req);

    // If path param is numeric id, enforce self-access for non-admin.
    const isNumericId =
      typeof idOrName === "string" &&
      idOrName.trim() !== "" &&
      !Number.isNaN(Number(idOrName));
    const isSelf =
      isNumericId &&
      requesterId !== undefined &&
      Number(idOrName) === Number(requesterId);

    if (isNumericId && !roleCtx.isAdmin && !isSelf) {
      return res.sendCommonValue(403, "Forbidden");
    }

    // If admin, enforce allowed target roles unless self
    if (isNumericId && roleCtx.isAdmin && !isSelf) {
      const meta = await getTargetUserMeta(Number(idOrName));
      if (!meta.exists) {
        return res.sendCommonValue(404, "user not found");
      }
      if (!canManageTargetRoles(roleCtx.allowedManagedRoles, meta.roles)) {
        return res.sendCommonValue(403, "Insufficient permission for this user");
      }
    }

    const result = isNumericId
      ? await userService.getUserbyIdAsync(idOrName)
      : await userService.getUserbyNameAsync(idOrName);

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
    const roleCtx = getRoleContext(req);
    if (!roleCtx.isAdmin) {
      return res.sendCommonValue(403, "Only admin or super admin can delete users");
    }

    const idList = ids.split(",").map((id) => Number(id));
    for (const id of idList) {
      const meta = await getTargetUserMeta(id);
      if (!meta.exists) {
        return res.sendCommonValue(404, "user not found");
      }
      if (!canManageTargetRoles(roleCtx.allowedManagedRoles, meta.roles)) {
        return res.sendCommonValue(403, "Insufficient permission for this user");
      }
    }

    const result = await userService.delUserByIdAsync(ids);
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
 * Update basic user fields .
 */
const updateProfileAsync = async (req, res, next) => {
  try {
    const { id } = req.params;
    const requesterId = req.user?.id;
    const roleCtx = getRoleContext(req);
    const admin = roleCtx.isAdmin;
    const isSelf = requesterId !== undefined && Number(id) === Number(requesterId);

    if (!admin && !isSelf) {
      return res.sendCommonValue(403, "Forbidden");
    }

    if (admin && !isSelf) {
      const meta = await getTargetUserMeta(Number(id));
      if (!meta.exists) {
        return res.sendCommonValue(404, "user not found");
      }
      if (!canManageTargetRoles(roleCtx.allowedManagedRoles, meta.roles)) {
        return res.sendCommonValue(403, "Insufficient permission for this user");
      }
    }

    const payload = {
      userName: req.body.userName,
      email: req.body.email,
      password: req.body.password,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
      address: req.body.address,
      gender: req.body.gender,
      dob: req.body.dob,
      avatar: req.body.avatar,
      bio: req.body.bio,
    };

    // strip undefined fields so we only update what was sent
    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined) {
        delete payload[key];
      }
    });

    if (payload.password) {
      payload.password = await bcrypt.hash(payload.password, saltRounds);
    }

    if (Object.keys(payload).length === 0) {
      return res.sendCommonValue(400, "no fields to update");
    }

    const result = await userService.updateProfileAsync(id, payload);
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
    const roleCtx = getRoleContext(req);
    if (!roleCtx.isAdmin) {
      return res.sendCommonValue(403, "Only admin or super admin can list users");
    }

    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;
    const result = await userService.getUserListAsync(page, pageSize);
    const allowedRoles = roleCtx.isSuperAdmin
      ? ["super admin", "admin", "teacher", "student"]
      : roleCtx.allowedManagedRoles;
    const filteredItems = (result.data?.items || []).filter((u) =>
      (u.roles || []).every((r) => allowedRoles.includes(normalizeRoleName(r)))
    );
    res.sendCommonValue(200, "success", {
      ...result.data,
      items: filteredItems,
      total: filteredItems.length,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addUserAsync,
  getProfileAsync,
  delUserAsync,
  updateProfileAsync,
  listAsync,
};
