'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const courses = [
      {
        title: 'Introduction to JavaScript',
        description: 'Learn the fundamentals of JavaScript programming language.',
        coverImage: '/images/courses/javascript.jpg',
        categoryId: 1,
        teacherId: 1,
        status: 'published',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Advanced React Development',
        description: 'Deep dive into React hooks, state management, and performance optimization.',
        coverImage: '/images/courses/react.jpg',
        categoryId: 1,
        teacherId: 1,
        status: 'published',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Node.js Backend Masterclass',
        description: 'Build scalable backend applications with Node.js and Express.',
        coverImage: '/images/courses/nodejs.jpg',
        categoryId: 1,
        teacherId: 2,
        status: 'published',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Database Design Fundamentals',
        description: 'Learn how to design efficient and scalable database schemas.',
        coverImage: '/images/courses/database.jpg',
        categoryId: 2,
        teacherId: 2,
        status: 'draft',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Python for Data Science',
        description: 'Introduction to Python programming for data analysis and visualization.',
        coverImage: '/images/courses/python.jpg',
        categoryId: 2,
        teacherId: 1,
        status: 'archived',
        active: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert('Course', courses, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Course', null, {});
  },
};
