"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // assumes Role ids: 1 super admin, 2 admin, 3 teacher, 4 student
    const rows = [
      { userId: 1, roleId: 1 },
      { userId: 1, roleId: 2 },
      { userId: 2, roleId: 3 },
    ];
    await queryInterface.bulkInsert("UserRole", rows, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("UserRole", {
      userId: [1, 2],
    });
  },
};
