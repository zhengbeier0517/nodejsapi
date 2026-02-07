"use strict";

const { DataTypes } = require("sequelize");
const { sequelize } = require("../db/sequelizedb");

function toCapitalized(value) {
  if (value == null) return value;
  const s = String(value).trim();
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },

    userName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: { notEmpty: true, len: [1, 50] },
    },

    email: {
      type: DataTypes.STRING(254),
      allowNull: false,
      unique: true,
      validate: { notEmpty: true, isEmail: true, len: [1, 254] },
    },

    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: { notEmpty: true, len: [8, 255] },
    },

    firstName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      set(value) {
        this.setDataValue("firstName", toCapitalized(value));
      },
      validate: { notEmpty: true, len: [1, 50] },
    },

    lastName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      set(value) {
        this.setDataValue("lastName", toCapitalized(value));
      },
      validate: { notEmpty: true, len: [1, 50] },
    },

    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        is: { args: [/^\d+$/], msg: "phone must be a numeric string" },
        len: [0, 20],
      },
    },

    address: { type: DataTypes.STRING(255), allowNull: true, validate: { len: [0, 255] } },

    gender: {
      type: DataTypes.ENUM("male", "female", "other"),
      allowNull: true,
    },

    dob: { type: DataTypes.DATEONLY, allowNull: true },

    avatar: { type: DataTypes.STRING(2048), allowNull: true, validate: { len: [0, 2048] } },

    bio: { type: DataTypes.STRING(500), allowNull: true, validate: { len: [0, 500] } },
  },
  {
    tableName: "User",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

User.associate = (models) => {
  User.belongsToMany(models.Role, {
    foreignKey: "userId",
    through: models.UserRole,
    as: "roles",
  });

  User.hasOne(models.Teacher, {
    foreignKey: "userId",
    as: "teacherProfile",
  });

  User.hasMany(models.Course, {
    foreignKey: "teacherId",
    as: "coursesAsTeacher",
  });
};

module.exports = User;
