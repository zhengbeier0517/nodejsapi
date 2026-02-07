const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../app");
const { jwtConfig } = require("../appConfig");
const { sequelize, Course } = require("../models");
const { sequelize: rawSequelize } = require("../db/sequelizedb");

// Admin token for authenticated + admin requests
const adminToken = jwt.sign(
  { id: 1, roles: ["admin"] },
  jwtConfig.accessSecret,
  {
    audience: jwtConfig.audience,
    issuer: jwtConfig.issuer,
    algorithm: jwtConfig.algorithms[0],
    expiresIn: "1h",
  }
);

// Regular user token (no admin role) for authorization tests
const userToken = jwt.sign(
  { id: 3, roles: ["teacher"] },
  jwtConfig.accessSecret,
  {
    audience: jwtConfig.audience,
    issuer: jwtConfig.issuer,
    algorithm: jwtConfig.algorithms[0],
    expiresIn: "1h",
  }
);

const adminAuth = { Authorization: `Bearer ${adminToken}` };
const userAuth = { Authorization: `Bearer ${userToken}` };

const createdCourseIds = [];

const createCourse = async (payload) => {
  return request(app)
    .post("/api/courses")
    .set(adminAuth)
    .send(payload);
};

describe("Course API", () => {
  afterAll(async () => {
    // Clean up test courses
    if (createdCourseIds.length > 0) {
      await Course.destroy({ where: { id: createdCourseIds } });
    }
    await rawSequelize.close();
    await sequelize.close();
  });

  // ─── Authentication ───────────────────────────────────────────
  describe("Authentication", () => {
    it("should return 401 when no token is provided", async () => {
      const res = await request(app).get("/api/courses");
      expect(res.status).toBe(401);
    });

    it("should return 401 when token is invalid", async () => {
      const res = await request(app)
        .get("/api/courses")
        .set({ Authorization: "Bearer invalidtoken" });
      expect(res.status).toBe(401);
    });
  });

  // ─── Authorization ────────────────────────────────────────────
  describe("Authorization", () => {
    it("should return 403 when non-admin tries to create a course", async () => {
      const res = await request(app)
        .post("/api/courses")
        .set(userAuth)
        .send({ title: "Unauthorized Course" });
      expect(res.status).toBe(403);
    });

    it("should return 403 when non-admin tries to update a course", async () => {
      const res = await request(app)
        .put("/api/courses/1")
        .set(userAuth)
        .send({ title: "Updated" });
      expect(res.status).toBe(403);
    });

    it("should return 403 when non-admin tries to delete a course", async () => {
      const res = await request(app)
        .delete("/api/courses/1")
        .set(userAuth);
      expect(res.status).toBe(403);
    });
  });

  // ─── Create ───────────────────────────────────────────────────
  describe("POST /api/courses", () => {
    it("should create a course with only a title", async () => {
      const res = await createCourse({ title: `Test Course ${Date.now()}` });
      expect(res.status).toBe(200);
      expect(res.body.isSuccess).toBe(true);
      expect(res.body.data.id).toBeTruthy();
      expect(res.body.data.status).toBe("draft");
      expect(res.body.data.active).toBe(true);
      createdCourseIds.push(res.body.data.id);
    });

    it("should create a course with all fields", async () => {
      const res = await createCourse({
        title: `Full Course ${Date.now()}`,
        description: "A complete test course",
        status: "published",
      });
      expect(res.status).toBe(200);
      expect(res.body.isSuccess).toBe(true);
      expect(res.body.data.description).toBe("A complete test course");
      expect(res.body.data.status).toBe("published");
      createdCourseIds.push(res.body.data.id);
    });

    it("should return 400 when title is missing", async () => {
      const res = await createCourse({ description: "No title" });
      expect(res.status).toBe(400);
    });

    it("should return 400 when status is invalid", async () => {
      const res = await createCourse({
        title: "Bad Status",
        status: "invalid",
      });
      expect(res.status).toBe(400);
    });
  });

  // ─── List ─────────────────────────────────────────────────────
  describe("GET /api/courses", () => {
    it("should return a paginated list of courses", async () => {
      const res = await request(app)
        .get("/api/courses")
        .set(adminAuth);
      expect(res.status).toBe(200);
      expect(res.body.isSuccess).toBe(true);
      expect(res.body.data).toHaveProperty("total");
      expect(res.body.data).toHaveProperty("rows");
      expect(res.body.data).toHaveProperty("page");
      expect(res.body.data).toHaveProperty("pageSize");
    });

    it("should support pagination parameters", async () => {
      const res = await request(app)
        .get("/api/courses?page=1&pageSize=2")
        .set(adminAuth);
      expect(res.status).toBe(200);
      expect(res.body.data.pageSize).toBe(2);
      expect(res.body.data.rows.length).toBeLessThanOrEqual(2);
    });

    it("should return 400 for invalid page parameter", async () => {
      const res = await request(app)
        .get("/api/courses?page=-1")
        .set(adminAuth);
      expect(res.status).toBe(400);
    });

    it("should allow regular users to list courses", async () => {
      const res = await request(app)
        .get("/api/courses")
        .set(userAuth);
      expect(res.status).toBe(200);
    });
  });

  // ─── Get One ──────────────────────────────────────────────────
  describe("GET /api/courses/:id", () => {
    it("should return a single course by id", async () => {
      const id = createdCourseIds[0];
      const res = await request(app)
        .get(`/api/courses/${id}`)
        .set(adminAuth);
      expect(res.status).toBe(200);
      expect(res.body.isSuccess).toBe(true);
      expect(res.body.data.id).toBe(id);
    });

    it("should return 400 for non-existent course", async () => {
      const res = await request(app)
        .get("/api/courses/999999")
        .set(adminAuth);
      expect(res.status).toBe(400);
    });

    it("should return 400 for invalid id format", async () => {
      const res = await request(app)
        .get("/api/courses/abc")
        .set(adminAuth);
      expect(res.status).toBe(400);
    });
  });

  // ─── Update ───────────────────────────────────────────────────
  describe("PUT /api/courses/:id", () => {
    it("should update a course title", async () => {
      const id = createdCourseIds[0];
      const newTitle = `Updated Course ${Date.now()}`;
      const res = await request(app)
        .put(`/api/courses/${id}`)
        .set(adminAuth)
        .send({ title: newTitle });
      expect(res.status).toBe(200);
      expect(res.body.isSuccess).toBe(true);
      expect(res.body.data.title).toBe(newTitle);
    });

    it("should update course status", async () => {
      const id = createdCourseIds[0];
      const res = await request(app)
        .put(`/api/courses/${id}`)
        .set(adminAuth)
        .send({ status: "archived" });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("archived");
    });

    it("should toggle course active flag", async () => {
      const id = createdCourseIds[0];
      const res = await request(app)
        .put(`/api/courses/${id}`)
        .set(adminAuth)
        .send({ active: false });
      expect(res.status).toBe(200);
      expect(res.body.data.active).toBe(false);
    });

    it("should return 400 for non-existent course", async () => {
      const res = await request(app)
        .put("/api/courses/999999")
        .set(adminAuth)
        .send({ title: "Nope" });
      expect(res.status).toBe(400);
    });

    it("should return 400 for invalid status value", async () => {
      const id = createdCourseIds[0];
      const res = await request(app)
        .put(`/api/courses/${id}`)
        .set(adminAuth)
        .send({ status: "invalid" });
      expect(res.status).toBe(400);
    });
  });

  // ─── Delete ───────────────────────────────────────────────────
  describe("DELETE /api/courses/:id", () => {
    it("should delete a course", async () => {
      // Create a course to delete
      const createRes = await createCourse({ title: `Delete Me ${Date.now()}` });
      const id = createRes.body.data.id;

      const res = await request(app)
        .delete(`/api/courses/${id}`)
        .set(adminAuth);
      expect(res.status).toBe(200);
      expect(res.body.isSuccess).toBe(true);

      // Verify it's gone
      const getRes = await request(app)
        .get(`/api/courses/${id}`)
        .set(adminAuth);
      expect(getRes.status).toBe(400);
    });

    it("should return 400 for non-existent course", async () => {
      const res = await request(app)
        .delete("/api/courses/999999")
        .set(adminAuth);
      expect(res.status).toBe(400);
    });
  });
});
