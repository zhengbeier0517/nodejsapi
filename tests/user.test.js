const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../app");
const { jwtConfig } = require("../appConfig");
const { User, Role, UserRole, sequelize } = require("../models");
const { sequelize: rawSequelize } = require("../db/sequelizedb");

const signToken = (id, roles) =>
  jwt.sign(
    { id, roles },
    jwtConfig.accessSecret,
    {
      audience: jwtConfig.audience,
      issuer: jwtConfig.issuer,
      algorithm: jwtConfig.algorithms[0],
      expiresIn: "1h",
    }
  );

const superAdminHeader = { Authorization: `Bearer ${signToken(90001, ["super admin"])}` };
const adminHeader = { Authorization: `Bearer ${signToken(90002, ["admin"])}` };

const buildUserPayload = (overrides = {}) => ({
  userName: `user-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
  password: "StrongPass123",
  email: `u-${Date.now()}-${Math.random().toString(16).slice(2, 6)}@example.com`,
  firstName: "Test",
  lastName: "User",
  roles: ["student"],
  ...overrides,
});

const findUserWithRoles = async (userName) => {
  return User.findOne({
    where: { userName },
    include: [
      {
        model: Role,
        as: "roles",
        attributes: ["name"],
        through: { attributes: [] },
      },
    ],
  });
};

describe("User API role management", () => {
  const usersToCleanup = [];

  afterAll(async () => {
    for (const userName of usersToCleanup) {
      const user = await User.findOne({ where: { userName } });
      if (user) {
        await UserRole.destroy({ where: { userId: user.id } });
        await User.destroy({ where: { id: user.id } });
      }
    }
    await rawSequelize.close();
    await sequelize.close();
  });

  it("super admin can create a user with super admin role", async () => {
    const payload = buildUserPayload({ roles: ["super admin", "admin"] });
    usersToCleanup.push(payload.userName);

    const res = await request(app).post("/api/users").set(superAdminHeader).send(payload);
    expect(res.status).toBe(200);
    expect(res.body.isSuccess).toBe(true);

    const created = await findUserWithRoles(payload.userName);
    expect(created).toBeTruthy();
    const roleNames = created.roles.map((r) => r.name.toLowerCase());
    expect(roleNames).toEqual(expect.arrayContaining(["super admin", "admin"]));
  });

  it("admin cannot assign super admin role on update", async () => {
    const payload = buildUserPayload({ roles: ["student"] });
    usersToCleanup.push(payload.userName);

    const resCreate = await request(app).post("/api/users").set(superAdminHeader).send(payload);
    expect(resCreate.status).toBe(200);

    const created = await findUserWithRoles(payload.userName);
    expect(created).toBeTruthy();

    const resUpdate = await request(app)
      .put(`/api/users/${created.id}`)
      .set(adminHeader)
      .send({ roles: ["super admin"] });
    expect(resUpdate.status).toBe(403);
  });

  it("admin can assign teacher/student roles", async () => {
    const payload = buildUserPayload({ roles: ["student"] });
    usersToCleanup.push(payload.userName);

    const resCreate = await request(app).post("/api/users").set(superAdminHeader).send(payload);
    expect(resCreate.status).toBe(200);

    const created = await findUserWithRoles(payload.userName);
    expect(created).toBeTruthy();

    const resUpdate = await request(app)
      .put(`/api/users/${created.id}`)
      .set(adminHeader)
      .send({ roles: ["teacher", "student"] });
    expect(resUpdate.status).toBe(200);
    expect(resUpdate.body.isSuccess).toBe(true);

    const updated = await findUserWithRoles(payload.userName);
    const roleNames = updated.roles.map((r) => r.name.toLowerCase());
    expect(roleNames.sort()).toEqual(["student", "teacher"]);
  });
});
