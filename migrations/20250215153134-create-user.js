"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("User", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      userName: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      email: {
        type: Sequelize.STRING(254),
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      firstName: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      lastName: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      phone: {
        type: Sequelize.STRING(20),
      },
      address: {
        type: Sequelize.STRING(255),
      },
      gender: {
        type: Sequelize.ENUM("male", "female", "other"),
      },
      dob: {
        type: Sequelize.DATEONLY,
      },
      avatar: {
        type: Sequelize.STRING(2048),
      },
      bio: {
        type: Sequelize.STRING(500),
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("User");

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_User_gender";'
    ).catch(() => {});
  },
};
