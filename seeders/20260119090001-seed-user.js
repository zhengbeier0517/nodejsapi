"use strict";

/** @type {import('sequelize-cli').Migration} */
const passwordHash = "$2b$10$L5JXqvvpqFqL6u1Xbn9YXOS46Ydlcn8UJvBTIv.uTjUJ9xaBi9k3i"; // hash for Passw0rd!
const users = [
  {
    id: 1,
    userName: "superadmin",
    email: "superadmin@example.com",
    password: passwordHash,
    firstName: "Super",
    lastName: "Admin",
  },
  {
    id: 2,
    userName: "teacher1",
    email: "teacher1@example.com",
    password: passwordHash,
    firstName: "Taylor",
    lastName: "Teacher",
  },
  {
    id: 3,
    userName: "student1",
    email: "student1@example.com",
    password: passwordHash,
    firstName: "Sam",
    lastName: "Student",
  },
];

const userRoles = [
  { userId: 1, roleId: 1 },
  { userId: 2, roleId: 3 },
  { userId: 3, roleId: 4 },
];

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("User", users, { ignoreDuplicates: true });
    await queryInterface.bulkInsert("UserRole", userRoles, { ignoreDuplicates: true });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("UserRole", {
      userId: userRoles.map((ur) => ur.userId),
    });
    await queryInterface.bulkDelete("User", {
      userName: users.map((u) => u.userName),
    });
  },
};
