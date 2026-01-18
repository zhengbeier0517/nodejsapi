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
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { notEmpty: true },
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { notEmpty: true, isEmail: true },
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true, len: [8, 255] },
    },

    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        this.setDataValue("firstName", toCapitalized(value));
      },
      validate: { notEmpty: true },
    },

    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        this.setDataValue("lastName", toCapitalized(value));
      },
      validate: { notEmpty: true },
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: { args: [/^\d+$/], msg: "phone must be a numeric string" },
      },
    },

    address: { type: DataTypes.STRING, allowNull: true },

    gender: {
      type: DataTypes.ENUM("male", "female", "other"),
      allowNull: true,
    },

    dob: { type: DataTypes.DATEONLY, allowNull: true },

    avatar: { type: DataTypes.STRING, allowNull: true },

    bio: { type: DataTypes.STRING, allowNull: true },
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
};

module.exports = User;
