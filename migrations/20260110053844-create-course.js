'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Course', {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      coverImage: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      categoryId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        // FK constraint added later when Category table exists
      },
      teacherId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        // FK constraint added later when Auth is ready
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      status: {
        type: Sequelize.ENUM('draft', 'published', 'archived'),
        allowNull: false,
        defaultValue: 'draft',
      },
      level: {
        type: Sequelize.ENUM('beginner', 'intermediate', 'advanced'),
        allowNull: true,
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Total duration in minutes',
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      // Placeholder fields for future modules
      totalChapters: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      enrollmentCount: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Add index for common queries
    await queryInterface.addIndex('Course', ['status']);
    await queryInterface.addIndex('Course', ['categoryId']);
    await queryInterface.addIndex('Course', ['teacherId']);
    await queryInterface.addIndex('Course', ['active']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Course');
  },
};
