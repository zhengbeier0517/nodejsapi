'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const categories = [
      {
        id: 1,
        name: 'Programming',
        description: 'Coding languages and frameworks',
        parentId: null,
        sortOrder: 1,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        name: 'Data',
        description: 'Databases, analytics, and data science',
        parentId: null,
        sortOrder: 2,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert('Category', categories, { ignoreDuplicates: true });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Category', {
      id: [1, 2],
    });
  },
};
