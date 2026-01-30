"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Permission", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      code: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Permission");
  },
};
