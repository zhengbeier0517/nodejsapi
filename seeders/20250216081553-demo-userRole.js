"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const userRoles = [
      {
        userId: 1,
        roleId: 1,
      },
      {
        userId: 1,
        roleId: 2,
      },
      {
        userId: 1,
        roleId: 3,
      },
      {
        userId: 1,
        roleId: 4,
      },
      {
        userId: 2,
        roleId: 2,
      },
      {
        userId: 2,
        roleId: 3,
      },
      {
        userId: 3,
        roleId: 3,
      },
    ];

    await queryInterface.bulkInsert("UserRole", userRoles, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("UserRole", null, {});
    await queryInterface.dropTable("UserRole");
  },
};
