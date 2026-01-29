"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("UserRole", {
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "User",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      roleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Role",
          key: "id",
        },
        onDelete: "CASCADE",
      },
    });

    await queryInterface.addConstraint("UserRole", {
      fields: ["userId", "roleId"],
      type: "unique",
      name: "uniq_user_role",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("UserRole");
  },
};
