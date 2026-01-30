'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if categories already exist
    const [existingCategories] = await queryInterface.sequelize.query(
      "SELECT COUNT(*) as count FROM Category"
    );

    if (existingCategories[0].count > 0) {
      console.log('Categories already exist, skipping...');
      return;
    }

    const categories = [
      {
        name: 'Web Development',
        description: 'Courses related to web development technologies',
        parentId: null,
        sortOrder: 1,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Data Science',
        description: 'Courses related to data science and analytics',
        parentId: null,
        sortOrder: 2,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Mobile Development',
        description: 'Courses related to mobile app development',
        parentId: null,
        sortOrder: 3,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert('Category', categories, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Category', null, {});
  },
};
