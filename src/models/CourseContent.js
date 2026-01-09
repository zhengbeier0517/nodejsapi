const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const CourseContent = sequelize.define('CourseContent', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'course_contents'
});

module.exports = CourseContent;