const { sequelize } = require("../db/sequelizedb");
const Role = require("../models/role");
const jwt = require("jsonwebtoken");
const { jwtConfig } = require("../appConfig");
const crypto = require("crypto");

const initDB = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
  } catch {
    throw new Error("Unable to initialize the database");
  }
};

const closeDB = async () => {
  try {
    await sequelize.close();
  } catch {
    throw new Error("Unable to close the database");
  }
};

const initRole = async () => {
  const names = ["super admin", "admin", "teacher", "student"];

  try {
    for (const name of names) {
      await Role.create({ name });
    }
  } catch {
    throw new Error("Unable to initialize the role table");
  }
};

const createAuthHeader = (user) => {
  const token = jwt.sign(
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

  return `Bearer ${token}`;
};

const admin = {
  id: 186,
  firstName: "test",
  lastName: "admin",
  roles: ["admin"],
};
const adminAuthHeader = createAuthHeader(admin);

const superAdmin = {
  id: 187,
  firstName: "test",
  lastName: "superadmin",
  roles: ["super admin"],
};
const superAdminAuthHeader = createAuthHeader(superAdmin);

const teacher = {
  id: 300,
  firstName: "test",
  lastName: "teacher",
  roles: ["teacher"],
};
const teacherAuthHeader = createAuthHeader(teacher);

const student = {
  id: 500,
  firstName: "test",
  lastName: "student",
  roles: ["student"],
};
const studentAuthHeader = createAuthHeader(student);

module.exports = {
  initDB,
  closeDB,
  initRole,
  adminAuthHeader,
  superAdminAuthHeader,
  teacherAuthHeader,
  studentAuthHeader,
};
