const User = require("../models/user");
const cacheHelper = require("../common/cache/cacheHelper");
const {
  EntityAlreadyExistsException,
  EntityNotFoundException,
  ValidationException,
} = require("../common/commonError");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  bcryptConfig,
  jwtConfig,
} = require("../appConfig");
const { withSqliteForeignKeysOff } = require("sequelize/lib/dialects/sqlite/sqlite-utils");

/**
 * Check if userName already exists
 * @param {string} userName
 */
const checkUserNameExists = async (userName) => {
  const user = await User.findOne({
    where: { userName },
    attributes: ["id"],
    raw: true,
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
    raw: true,
  });

  if (user) {
    throw new EntityAlreadyExistsException("Email already exists");
  }
};

/**
 * Check if otp is valid
 * @param {string} email
 * @param {string} otp
 */
const checkOtpValid = async (email, otp) => {
  const validOtp = "123456";
  console.log(`Sending OTP ${validOtp} to email ${email}...`);

  if (otp !== validOtp) {
    throw new ValidationException("Wrong OTP");
  }
};

/**
 * Register
 * @param {*} payload
 * @returns
 */
const register = async (payload) => {
  await checkUserNameExists(payload.userName);
  const hashedPassword = await bcrypt.hash(payload.password, bcryptConfig.saltRounds);
  await checkEmailExists(payload.email);
  await checkOtpValid(payload.email, payload.otp);

  const newUser = await User.create({
    userName: payload.userName,
    password: hashedPassword,
    firstName: payload.firstName,
    lastName:payload.lastName,
    email: payload.email,
  });
  return {
    isSuccess: true,
    message: "Registration successful",
    data: {
      id: newUser.id,
      userName: newUser.userName,
      email: newUser.email,
    },
  };
};

/**
 * Get user by userName
 * @param {string} userName
 * @returns
 */
const getByUserName = async (userName) => {
  const user = await User.findOne({
    where: { userName },
    attributes: ["id", "password"],
    raw: true,
  });

  if (!user) {
    throw new EntityNotFoundException("Username not found");
  }

  return user;
};

/**
 * Login
 * @param {*} payload
 * @returns
 */
const login = async (payload) => {
  const user = await getByUserName(payload.userName);
  const isPasswordMatch = await bcrypt.compare(payload.password, user.password);

  if (!isPasswordMatch) {
    return {
      isSuccess: false,
      message: "Invalid username or password",
    };
  }

  const token = jwt.sign(
    {
      id: user.id,
    },
    jwtConfig.secret,
    {
      audience: jwtConfig.audience,
      issuer: jwtConfig.issuer,
      algorithm: jwtConfig.algorithms[0],
      expiresIn: jwtConfig.expiresIn,
    },
  );

  return {
    isSuccess: true,
    message: "Login successful",
    data: { token },
  };
};

/**
 * Logout
 * @param {string} token
 * @returns
 */
const logout = async (token) => {
  const decoded = jwt.decode(token);
  const ttl = decoded.exp * 1000 - Date.now();

  if (ttl > 0) {
    await cacheHelper.setAsync(token, true, ttl);
  }

  return {
    isSuccess: true,
    message: "Logout successful",
  };
};

module.exports = {
  register,
  login,
  logout,
};
