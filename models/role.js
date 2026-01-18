"use strict";

const { DataTypes } = require("sequelize");
const { sequelize } = require("../db/sequelizedb");

const Role = sequelize.define(
  "Role",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.ENUM("super admin", "admin", "teacher", "student"),
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: "Role",
    timestamps: false,
  }
);

Role.associate = (models) => {
  Role.belongsToMany(models.User, {
    foreignKey: "roleId",
    through: models.UserRole,
    as: "users",
  });

  Role.belongsToMany(models.Permission, {
    foreignKey: "roleId",
    through: models.RolePermission,
    as: "permissions",
  });
};

module.exports = Role;
