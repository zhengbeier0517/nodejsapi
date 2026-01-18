"use strict";

const { DataTypes } = require("sequelize");
const { sequelize } = require("../db/sequelizedb");

const UserRole = sequelize.define(
  "UserRole",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
  },
  {
    tableName: "UserRole",
    timestamps: false,
    indexes: [
      { unique: true, fields: ["userId", "roleId"] }, // 联合唯一
    ],
  }
);

module.exports = UserRole;
