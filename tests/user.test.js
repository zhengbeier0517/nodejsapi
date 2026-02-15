const request = require("supertest");
const app = require("../app");
const { User, Role, UserRole } = require("../models");
const {
  adminAuthHeader,
  superAdminAuthHeader,
  teacherAuthHeader,
  studentAuthHeader,
} = require("./testHelper");

const buildUserPayload = (overrides = {}) => ({
  userName: `user-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
  password: "StrongPass123",
  email: `u-${Date.now()}-${Math.random().toString(16).slice(2, 6)}@example.com`,
  firstName: "Test",
  lastName: "User",
  roles: ["student"],
  ...overrides,
});

const createUser = (payload, authHeader = superAdminAuthHeader) =>
  request(app).post("/api/users").set("Authorization", authHeader).send(payload);

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
  });

  it("super admin can create a user with super admin role", async () => {
    const payload = buildUserPayload({ roles: ["super admin", "admin"] });
    usersToCleanup.push(payload.userName);

    const res = await createUser(payload, superAdminAuthHeader);
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

    const resCreate = await createUser(payload, superAdminAuthHeader);
    expect(resCreate.status).toBe(200);

    const created = await findUserWithRoles(payload.userName);
    expect(created).toBeTruthy();

    const resUpdate = await request(app)
      .put(`/api/users/${created.id}`)
      .set("Authorization", adminAuthHeader)
      .send({ roles: ["super admin"] });
    expect(resUpdate.status).toBe(403);
  });

  it("admin can assign teacher/student roles", async () => {
    const payload = buildUserPayload({ roles: ["student"] });
    usersToCleanup.push(payload.userName);

    const resCreate = await createUser(payload, superAdminAuthHeader);
    expect(resCreate.status).toBe(200);

    const created = await findUserWithRoles(payload.userName);
    expect(created).toBeTruthy();

    const resUpdate = await request(app)
      .put(`/api/users/${created.id}`)
      .set("Authorization", adminAuthHeader)
      .send({ roles: ["teacher", "student"] });
    expect(resUpdate.status).toBe(200);
    expect(resUpdate.body.isSuccess).toBe(true);

    const updated = await findUserWithRoles(payload.userName);
    const roleNames = updated.roles.map((r) => r.name.toLowerCase());
    expect(roleNames.sort()).toEqual(["student", "teacher"]);
  });

  it("teacher cannot list users", async () => {
    const res = await request(app).get("/api/users").set("Authorization", teacherAuthHeader);
    expect(res.status).toBe(403);
  });

  it("student cannot create users", async () => {
    const payload = buildUserPayload();
    const res = await createUser(payload, studentAuthHeader);
    expect(res.status).toBe(403);
  });

  it("admin cannot create user with admin role", async () => {
    const payload = buildUserPayload({ roles: ["admin"] });
    usersToCleanup.push(payload.userName);

    const res = await createUser(payload, adminAuthHeader);
    expect(res.status).toBe(403);
  });

  it("admin cannot view another super admin profile", async () => {
    const payload = buildUserPayload({ roles: ["super admin"] });
    usersToCleanup.push(payload.userName);
    await createUser(payload, superAdminAuthHeader);
    const created = await findUserWithRoles(payload.userName);
    expect(created).toBeTruthy();

    const res = await request(app)
      .get(`/api/users/${created.id}`)
      .set("Authorization", adminAuthHeader);
    expect(res.status).toBe(403);
  });

  it("admin cannot delete another super admin", async () => {
    const payload = buildUserPayload({ roles: ["super admin"] });
    usersToCleanup.push(payload.userName);
    await createUser(payload, superAdminAuthHeader);
    const created = await findUserWithRoles(payload.userName);
    expect(created).toBeTruthy();

    const res = await request(app)
      .delete(`/api/users/${created.id}`)
      .set("Authorization", adminAuthHeader);
    expect(res.status).toBe(403);
  });
});
