"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if users already exist
    const [existingUsers] = await queryInterface.sequelize.query(
      "SELECT COUNT(*) as count FROM User WHERE userName IN ('user1', 'admin')"
    );

    if (existingUsers[0].count > 0) {
      console.log('Demo users already exist, skipping...');
      return;
    }

    await queryInterface.bulkInsert(
      "User",
      [
        {
          userName: "user1",
          password:
            "$2b$10$ig9HBJNu6OgmwSnbPn/jWupbPPq1LC4Ee5uptADcG/Ho3M1e3VM1S",
          email: "user1@example.com",
          firstName: "User",
          lastName: "One",
          gender: "other",
          dob: "1995-01-15",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          userName: "admin",
          password:
            "$2b$10$ig9HBJNu6OgmwSnbPn/jWupbPPq1LC4Ee5uptADcG/Ho3M1e3VM1S",
          email: "admin@example.com",
          firstName: "Admin",
          lastName: "User",
          gender: "other",
          dob: "1990-05-20",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */

    //  await queryInterface.bulkDelete("user", null, {});
    await queryInterface.bulkDelete("User", null, {});
    // delete table if necessary   to use reset-db command in package.json
    await queryInterface.dropTable("User");
  },
};
