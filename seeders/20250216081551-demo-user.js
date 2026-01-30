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
        password: "$2b$10$O1wB2o0sv8iejTDCUx0ia.6TYH1sfV/eu.4dOemedyIOXbswba6Cu",
      },
      {
        firstName: "Si",
        lastName: "Li",
        userName: "lisi",
        email: "lisi@example.com",
        password: "$2b$10$O1wB2o0sv8iejTDCUx0ia.6TYH1sfV/eu.4dOemedyIOXbswba6Cu",
      },
      {
        firstName: "Wu",
        lastName: "Wang",
        userName: "wangwu",
        email: "wangwu@example.com",
        password: "$2b$10$O1wB2o0sv8iejTDCUx0ia.6TYH1sfV/eu.4dOemedyIOXbswba6Cu",
      },
    ];

    await queryInterface.bulkInsert("User", users, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("User", null, {});
    await queryInterface.dropTable("User");
  },
};
