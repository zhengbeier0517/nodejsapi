"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const users = [
      {
        firstName: "San",
        lastName: "Zhang",
        userName: "zhangsan",
        email: "zhangsan@example.com",
        password: "zhangsan",
      },
      {
        firstName: "Si",
        lastName: "Li",
        userName: "lisi",
        email: "lisi@example.com",
        password: "lisi",
      },
      {
        firstName: "Wu",
        lastName: "Wang",
        userName: "wangwu",
        email: "wangwu@example.com",
        password: "wangwu",
      },
    ];

    await queryInterface.bulkInsert("User", users, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("User", null, {});
    await queryInterface.dropTable("User");
  },
};
