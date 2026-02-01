"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // skip if table already has data to avoid unique conflicts with earlier seeders
    const [existing] = await queryInterface.sequelize.query(
      "SELECT COUNT(*) AS cnt FROM UserRole"
    );
    if (existing[0].cnt > 0) {
      return;
    }

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
