"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert(
      "User",
      [
        {
          userName: "admin",
          firstName: "Admin",
          lastName: "User",
          email: "admin@example.com",
          password:
            "$2b$10$DKBYkPG9userv3D9NjHKU.lE4PqcAl2k7TkGbk0FmLv1xX8XnoTl.",
          createdAt: now,
          updatedAt: now,
        },
        {
          userName: "teacher",
          firstName: "Teacher",
          lastName: "One",
          email: "teacher@example.com",
          password:
            "$2b$10$pcfza0ZHoIv7fpEmkiV16uZwflkl/y0Qfq11O9LlG2ro49Obu3LIe",
          createdAt: now,
          updatedAt: now,
        },
      ],
      {}
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("User", {
      userName: ["admin", "teacher"],
    });
  },
};
