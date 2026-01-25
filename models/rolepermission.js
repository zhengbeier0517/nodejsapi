"use strict";

const { DataTypes } = require("sequelize");
const { sequelize } = require("../db/sequelizedb");

const RolePermission = sequelize.define(
  "RolePermission",
  {
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    permissionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
  },
  {
    tableName: "RolePermission",
    timestamps: false,
    indexes: [
      { unique: true, fields: ["roleId", "permissionId"] }, // 联合唯一
    ],
  }
);

module.exports = RolePermission;
