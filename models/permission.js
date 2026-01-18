"use strict";

const { DataTypes } = require("sequelize");
const { sequelize } = require("../db/sequelizedb");

const Permission = sequelize.define(
  "Permission",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    code: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: "Permission",
    timestamps: false,
  }
);

Permission.associate = (models) => {
  Permission.belongsToMany(models.Role, {
    foreignKey: "permissionId",
    through: models.RolePermission,
    as: "roles",
  });
};

module.exports = Permission;
