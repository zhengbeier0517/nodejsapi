const User = require("../models/user");
const {
  EntityAlreadyExistsException,
  ValidationException,
} = require("../common/commonError");
const bcrypt = require("bcryptjs");
const { bcryptConfig } = require("../appConfig");

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
 * @param {*} user
 * @returns
 */
const register = async (user) => {
  await checkUserNameExists(user.userName);
  const hashedPassword = await bcrypt.hash(user.password, bcryptConfig.saltRounds);
  await checkEmailExists(user.email);
  await checkOtpValid(user.email, user.otp);

  const newUser = await User.create({
    userName: user.userName,
    password: hashedPassword,
    email: user.email,
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

module.exports = {
  register,
};
