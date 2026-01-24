const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = Course;