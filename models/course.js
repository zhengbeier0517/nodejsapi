const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/sequelizedb');

const Course = sequelize.define(
  'Course',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    coverImage: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    teacherId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'archived'),
      allowNull: false,
      defaultValue: 'draft',
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    timestamps: true,
    tableName: 'Course',
  },
);

Course.associate = (models) => {
  Course.belongsTo(models.Category, { foreignKey: 'categoryId', as: 'category' });
  Course.belongsTo(models.User, { foreignKey: 'teacherId', as: 'teacher' });
}

module.exports = Course;
