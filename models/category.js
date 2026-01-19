const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/sequelizedb');

const Category = sequelize.define(
  'Category',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: 'Category',
    timestamps: true,
  }
);

Category.associate = function (models) {
  Category.belongsTo(models.Category, { foreignKey: 'parentId', as: 'parent' });
  Category.hasMany(models.Category, { foreignKey: 'parentId', as: 'children' });
  Category.hasMany(models.Course, { foreignKey: 'categoryId', as: 'courses' });
};

module.exports = Category;
