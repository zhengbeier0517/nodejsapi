const User = require("../models/user");
const Role = require("../models/role");
const UserRole = require("../models/userRole");
const cacheHelper = require("../common/cache/cacheHelper");
const {
  EntityAlreadyExistsException,
  EntityNotFoundException,
} = require("../common/commonError");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  bcryptConfig,
  jwtConfig,
} = require("../appConfig");
const crypto = require("crypto");

/**
 * Check if username already exists
 * @param {string} userName
 */
const checkUsernameExists = async (userName) => {
  const user = await User.findOne({
    where: { userName },
    attributes: ["id"],
  });
  if (user) {
    throw new EntityAlreadyExistsException("Username already exists");
  }
};

/**
 * Check if email already exists
 * @param {string} email
 */
const checkEmailExists = async (email) => {
  const user = await User.findOne({
    where: { email },
    attributes: ["id"],
  });

  if (user) {
    throw new EntityAlreadyExistsException("Email already exists");
  }
};

/**
 * Verify email
 * @param {string} email
 * @returns
 */
const verifyEmail = async (email) => {
  const testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  const info = await transporter.sendMail({
    from: `"No Reply" <${testAccount.user}>`,
    to: email,
    subject: "Verify Email",
    html: `<a href="#">Click here to verify your email address</a>`,
  });

  return nodemailer.getTestMessageUrl(info);
};

/**
 * Register
 * @param {*} payload
 * @returns
 */
const register = async (payload) => {
  await checkUsernameExists(payload.userName);
  await checkEmailExists(payload.email);
  const hashedPassword = await bcrypt.hash(payload.password, bcryptConfig.saltRounds);

  const newUser = await User.create({
    firstName: payload.firstName,
    lastName: payload.lastName,
    userName: payload.userName,
    email: payload.email,
    password: hashedPassword,
  });
  await UserRole.create({
    userId: newUser.id,
    roleId: 4,
  });

  const verifyEmailUrl = await verifyEmail(payload.email);

  return {
    isSuccess: true,
    message: "Registration successful",
    data: {
      id: newUser.id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      userName: newUser.userName,
      email: newUser.email,
      roles: ["student"],
      verifyEmailUrl,
    },
  };
};

/**
 * Get user by username
 * @param {string} userName
 * @returns
 */
const getByUsername = async (userName) => {
  const user = await User.findOne({
    where: { userName },
    attributes: ["id", "firstName", "lastName", "password"],
    include: [
      {
        model: Role,
        as: "roles",
        attributes: ["name"],
        through: { attributes: [] },
      },
    ],
  });

  if (!user) {
    throw new EntityNotFoundException("User not found");
  }

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    password: user.password,
    roles: user.roles.map((role) => role.name),
  };
};

/**
 * Sign access token
 * @param {*} user
 * @returns
 */
const signAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles,
      jti: crypto.randomUUID(),
    },
    jwtConfig.accessSecret,
    {
      audience: jwtConfig.audience,
      issuer: jwtConfig.issuer,
      algorithm: jwtConfig.algorithms[0],
      expiresIn: jwtConfig.accessExpiresIn,
    }
  );
};

/**
 * Sign refresh token
 * @param {*} user
 * @returns
 */
const signRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles,
      jti: crypto.randomUUID(),
    },
    jwtConfig.refreshSecret,
    {
      audience: jwtConfig.audience,
      issuer: jwtConfig.issuer,
      algorithm: jwtConfig.algorithms[0],
      expiresIn: jwtConfig.refreshExpiresIn,
    }
  );
};

/**
 * Login
 * @param {*} payload
 * @returns
 */
const login = async (payload) => {
  const user = await getByUsername(payload.userName);

  // Check if user is disabled
  const isDisabled = await cacheHelper.getAsync(`auth:disableUser:${user.id}`);
  if (isDisabled) {
    return {
      isSuccess: false,
      message: "User is disabled",
    };
  }

  // Check if password is correct
  const isPasswordMatch = await bcrypt.compare(payload.password, user.password);
  if (!isPasswordMatch) {
    return {
      isSuccess: false,
      message: "Invalid username or password",
    };
  }

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  return {
    isSuccess: true,
    message: "Login successful",
    data: {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
      },
      accessToken,
      refreshToken,
    },
  };
};

/**
 * Refresh
 * @param {string} refreshToken
 * @returns
 */
const refresh = async (refreshToken) => {
  // Check if refresh token is valid
  let decoded;
  try {
    decoded = jwt.verify(
      refreshToken,
      jwtConfig.refreshSecret,
      {
        audience: jwtConfig.audience,
        issuer: jwtConfig.issuer,
        algorithms: jwtConfig.algorithms,
      }
    );
  } catch {
    return {
      isSuccess: false,
      message: "Refresh token is invalid or expired",
    };
  }

  // Check if refresh token is blacklisted
  const isBlacklisted = await cacheHelper.getAsync(`auth:refresh:${decoded.id}:${decoded.jti}`);
  if (isBlacklisted) {
    return {
      isSuccess: false,
      message: "Refresh token is blacklisted",
    };
  }

  // Check if user is forced to logout
  const forceLogoutAt = await cacheHelper.getAsync(`auth:forceLogout:${decoded.id}`);
  if (forceLogoutAt && decoded.iat * 1000 < forceLogoutAt) {
    return {
      isSuccess: false,
      message: "User is forced to logout",
    };
  }

  // Check if user is disabled
  const isDisabled = await cacheHelper.getAsync(`auth:disableUser:${decoded.id}`);
  if (isDisabled) {
    return {
      isSuccess: false,
      message: "User is disabled",
    };
  }

  const user = {
    id: decoded.id,
    firstName: decoded.firstName,
    lastName: decoded.lastName,
    roles: decoded.roles,
  };
  const newAccessToken = signAccessToken(user);

  return {
    isSuccess: true,
    message: "Refresh successful",
    data: {
      accessToken: newAccessToken,
    },
  };
};

/**
 * Blacklist token
 * @param {string} token
 * @param {string} type
 */
const blacklistToken = async (token, type) => {
  const decoded = jwt.decode(token);
  const ttl = decoded.exp * 1000 - Date.now();

  if (ttl > 0) {
    await cacheHelper.setAsync(`auth:${type}:${decoded.id}:${decoded.jti}`, true, ttl);
  }
};

/**
 * Logout
 * @param {string} accessToken
 * @param {string} refreshToken
 * @returns
 */
const logout = async (accessToken, refreshToken) => {
  await blacklistToken(accessToken, "access");
  await blacklistToken(refreshToken, "refresh");

  return {
    isSuccess: true,
    message: "Logout successful",
  };
};

/**
 * Check if user exists
 * @param {number} userId
 */
const checkUserExists = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: ["id"],
  });

  if (!user) {
    throw new EntityNotFoundException("User not found");
  }
};

/**
 * Parse expiresIn to milliseconds
 * @param {string} expiresIn
 * @returns
 */
const parseExpiresInToMs = (expiresIn) => {
  const m = expiresIn.match(/^(\d+(\.\d+)?)(ms|s|m|h|d|w|y)$/);

  if (!m) {
    throw new Error("Invalid expiresIn format");
  }

  const value = Number(m[1]);
  const unit = m[3];
  const unitToMs = {
    ms: 1,
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
    w: 7 * 24 * 60 * 60 * 1000,
    y: 365 * 24 * 60 * 60 * 1000,
  };

  return value * unitToMs[unit];
};

/**
 * Force logout
 * @param {number} userId
 * @returns
 */
const forceLogout = async (userId) => {
  await checkUserExists(userId);
  const forceLogoutAt = Date.now();
  const ttl = parseExpiresInToMs(jwtConfig.refreshExpiresIn);
  await cacheHelper.setAsync(`auth:forceLogout:${userId}`, forceLogoutAt, ttl);

  return {
    isSuccess: true,
    message: "Force logout successful",
  };
};

/**
 * Disable user
 * @param {number} userId
 * @returns
 */
const disableUser = async (userId) => {
  await checkUserExists(userId);
  const ttl = parseExpiresInToMs("100y");
  await cacheHelper.setAsync(`auth:disableUser:${userId}`, true, ttl);

  return {
    isSuccess: true,
    message: "Disable user successful",
  };
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  forceLogout,
  disableUser,
};
