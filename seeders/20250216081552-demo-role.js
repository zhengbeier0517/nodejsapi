"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const roles = [
      { name: "super admin" },
      { name: "admin" },
      { name: "teacher" },
      { name: "student" },
    ];

    await queryInterface.bulkInsert("Role", roles, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Role", null, {});
    await queryInterface.dropTable("Role");
  },
};
