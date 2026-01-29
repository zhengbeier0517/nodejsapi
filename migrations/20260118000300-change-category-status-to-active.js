'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // rename column
    await queryInterface.renameColumn('Category', 'status', 'active');
    // convert enum to boolean
    await queryInterface.sequelize.query(
      "UPDATE `Category` SET `active` = CASE WHEN `active` = 'Enabled' THEN 1 ELSE 0 END;"
    );
    await queryInterface.changeColumn('Category', 'active', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Category', 'active', {
      type: Sequelize.ENUM('Enabled', 'Disabled'),
      allowNull: false,
      defaultValue: 'Enabled',
    });
    await queryInterface.sequelize.query(
      "UPDATE `Category` SET `active` = CASE WHEN `active` = 1 THEN 'Enabled' ELSE 'Disabled' END;"
    );
    await queryInterface.renameColumn('Category', 'active', 'status');
  },
};
