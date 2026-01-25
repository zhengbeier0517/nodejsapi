const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/sequelizedb');

const CourseContent = sequelize.define('CourseContent', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: false, 
    comment: 'References Course table'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'course_contents',
  freezeTableName: true, 
  timestamps: true
});

module.exports = CourseContent;