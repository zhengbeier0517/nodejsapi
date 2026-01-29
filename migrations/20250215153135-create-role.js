"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Role", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.ENUM("super admin", "admin", "teacher", "student"),
        allowNull: false,
        unique: true,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Role");
    await queryInterface.sequelize
      .query('DROP TYPE IF EXISTS "enum_Role_name";')
      .catch(() => {});
  },
};
