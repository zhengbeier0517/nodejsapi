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

  try {
    const hashedPassword = await bcrypt.hash(payload.password, bcryptConfig.saltRounds);
  } catch {
    throw new Error("Password hashing failed");
  }

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

  try {
    const verifyEmailUrl = await verifyEmail(payload.email);
  } catch {
    throw new Error("Email verification failed");
  }

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
    attributes: ["id", "password"],
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
    throw new EntityNotFoundException("Username not found");
  }

  return {
    id: user.id,
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
      roles: user.roles,
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
      roles: user.roles,
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

  try {
    const isPasswordMatch = await bcrypt.compare(payload.password, user.password);
  } catch {
    throw new Error("Password comparison failed");
  }

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
  // Check if refresh token exists
  if (!refreshToken) {
    return {
      isSuccess: false,
      message: "Refresh token is required",
    };
  }

  // Check if refresh token is blacklisted
  const isBlacklisted = await cacheHelper.hasAsync(refreshToken);
  if (isBlacklisted) {
    return {
      isSuccess: false,
      message: "Refresh token is blacklisted",
    };
  }

  // Check if refresh token is valid
  try {
    const decoded = jwt.verify(
      refreshToken,
      jwtConfig.refreshSecret,
      {
        audience: jwtConfig.audience,
        issuer: jwtConfig.issuer,
        algorithms: jwtConfig.algorithms,
      }
    );
    const user = {
      id: decoded.id,
      roles: decoded.roles,
    };
    const newAccessToken = signAccessToken(user);

    return {
      isSuccess: true,
      message: "",
      data: {
        accessToken: newAccessToken,
        refreshToken,
      },
    };
  } catch {
    return {
      isSuccess: false,
      message: "Refresh token is invalid or expired",
    };
  }
};

/**
 * Decode token
 * @param {string} token
 */
const decodeToken = async (token) => {
  const decoded = jwt.decode(token);
  const ttl = decoded.exp * 1000 - Date.now();

  if (ttl > 0) {
    await cacheHelper.setAsync(token, true, ttl);
  }
};

/**
 * Logout
 * @param {string} accessToken
 * @param {string} refreshToken
 * @returns
 */
const logout = async (accessToken, refreshToken) => {
  try {
    await decodeToken(accessToken);

    if (refreshToken) {
      await decodeToken(refreshToken);
    }

    return {
      isSuccess: true,
      message: "Logout successful",
    };
  } catch {
    return {
      isSuccess: false,
      message: "Logout failed",
    };
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
};
