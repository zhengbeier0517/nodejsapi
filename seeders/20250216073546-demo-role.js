"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if roles already exist
    const [existingRoles] = await queryInterface.sequelize.query(
      "SELECT COUNT(*) as count FROM Role"
    );

    if (existingRoles[0].count > 0) {
      console.log('Roles already exist, skipping...');
      return;
    }

    const roles = [
      { name: "super admin" },
      { name: "admin" },
      { name: "teacher" },
      { name: "student" },
    ];

    await queryInterface.bulkInsert("Role", roles, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Role", {
      name: ["super admin", "admin", "teacher", "student"],
    });
  },
};
