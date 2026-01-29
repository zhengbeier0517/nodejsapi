"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    /* ===================== User ===================== */
    await queryInterface.createTable("User", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      userName: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      phone: {
        type: Sequelize.STRING,
      },
      address: {
        type: Sequelize.STRING,
      },
      gender: {
        type: Sequelize.ENUM("male", "female", "other"),
      },
      dob: {
        type: Sequelize.DATEONLY,
      },
      avatar: {
        type: Sequelize.STRING,
      },
      bio: {
        type: Sequelize.STRING,
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

    /* ===================== Role ===================== */
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

    /* ===================== Permission ===================== */
    await queryInterface.createTable("Permission", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      code: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
      },
    });

    /* ===================== UserRole ===================== */
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

    /* ===================== RolePermission ===================== */
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

    /* ===================== Teacher ===================== */
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

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Teacher");
    await queryInterface.dropTable("RolePermission");
    await queryInterface.dropTable("UserRole");
    await queryInterface.dropTable("Permission");
    await queryInterface.dropTable("Role");
    await queryInterface.dropTable("User");

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_User_gender";'
    ).catch(() => {});
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_Role_name";'
    ).catch(() => {});
  },
};
