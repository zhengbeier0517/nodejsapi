"use strict";

/** @type {import('sequelize-cli').Migration} */
const roles = [
  { id: 1, name: "super admin" },
  { id: 2, name: "admin" },
  { id: 3, name: "teacher" },
  { id: 4, name: "student" },
];

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("Role", roles, { ignoreDuplicates: true });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Role", {
      name: roles.map((r) => r.name),
    });
  },
};
