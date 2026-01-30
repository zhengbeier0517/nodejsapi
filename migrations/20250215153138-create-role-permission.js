"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("RolePermission", {
      roleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Role",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      permissionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Permission",
          key: "id",
        },
        onDelete: "CASCADE",
      },
    });

    await queryInterface.addConstraint("RolePermission", {
      fields: ["roleId", "permissionId"],
      type: "unique",
      name: "uniq_role_permission",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("RolePermission");
  },
};
