"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Teacher", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: "User",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      expertise: {
        type: Sequelize.STRING,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Teacher");
  },
};
