"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert(
      "Category",
      [
        {
          name: "Programming",
          description: "Programming courses",
          parentId: null,
          sortOrder: 1,
          active: true,
          createdAt: now,
          updatedAt: now,
        },
        {
          name: "Data",
          description: "Data / analytics courses",
          parentId: null,
          sortOrder: 2,
          active: true,
          createdAt: now,
          updatedAt: now,
        },
      ],
      {}
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("Category", {
      name: ["Programming", "Data"],
    });
  },
};
