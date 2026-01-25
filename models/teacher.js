"use strict";

const { DataTypes } = require("sequelize");
const { sequelize } = require("../db/sequelizedb");

const Teacher = sequelize.define(
  "Teacher",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    expertise: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "Teacher",
    timestamps: false,
  }
);

Teacher.associate = (models) => {
  Teacher.belongsTo(models.User, {
    foreignKey: "userId",
    as: "user",
  });
};

module.exports = Teacher;
