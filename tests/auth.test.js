const request = require("supertest");
const app = require("../app");
const { adminAuthHeader, studentAuthHeader } = require("./testHelper");

describe("Register", () => {
  test("Registration successful", async () => {
    const res = await request(app).post("/api/auth/register").send({
      firstName: "John",
      lastName: "Doe",
      userName: "johndoe",
      email: "johndoe@example.com",
      password: "12345678",
    });
    expect(res.status).toBe(201);
  }, 10000); // Wait for 10s to ensure the user receives the verification email

  test("Registration failed with empty field", async () => {
    const res = await request(app).post("/api/auth/register").send({
      firstName: "John",
      lastName: "Doe",
      userName: "johndoe",
      email: "johndoe@example.com",
      password: "",
    });
    expect(res.status).toBe(400);
  }, 10000); // Wait for 10s to ensure the user receives the verification email

  test("Registration failed with existing user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      firstName: "John",
      lastName: "Doe",
      userName: "johndoe",
      email: "johndoe@example.com",
      password: "12345678",
    });
    expect(res.status).toBe(409);
  }, 10000); // Wait for 10s to ensure the user receives the verification email
});

describe("Login", () => {
  test("Login successful", async () => {
    const res = await request(app).post("/api/auth/login").send({
      userName: "johndoe",
      password: "12345678",
    });
    expect(res.status).toBe(200);
  });

  test("Login failed with wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      userName: "johndoe",
      password: "87654321",
    });
    expect(res.status).toBe(400);
  });

  test("Login failed with unknown user", async () => {
    const res = await request(app).post("/api/auth/login").send({
      userName: "doejohn",
      password: "12345678",
    });
    expect(res.status).toBe(404);
  });
});

describe("Refresh", () => {
  test("Refresh successful", async () => {
    const loginRes= await request(app).post("/api/auth/login").send({
      userName: "johndoe",
      password: "12345678",
    });
    const { refreshToken } = loginRes.body.data;

    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1s to ensure the new access token is different from the old one
    const res = await request(app).post("/api/auth/refresh").send({
      refreshToken,
    });
    expect(res.status).toBe(200);
  });
});

describe("Logout", () => {
  test("Logout successful", async () => {
    const loginRes= await request(app).post("/api/auth/login").send({
      userName: "johndoe",
      password: "12345678",
    });
    const { accessToken, refreshToken } = loginRes.body.data;

    const res = await request(app).post("/api/auth/logout").set("Authorization", `Bearer ${accessToken}`).send({
      refreshToken,
    });
    expect(res.status).toBe(200);
  });

  test("Logout failed with invalid token", async () => {
    const loginRes= await request(app).post("/api/auth/login").send({
      userName: "johndoe",
      password: "12345678",
    });
    const { accessToken, refreshToken } = loginRes.body.data;

    await request(app).post("/api/auth/logout").set("Authorization", `Bearer ${accessToken}`).send({
      refreshToken,
    });
    const res = await request(app).post("/api/auth/logout").set("Authorization", `Bearer ${accessToken}`).send({
      refreshToken,
    });
    expect(res.status).toBe(401);
  });
});

describe("Force logout", () => {
  test("Force failed with non-admin user", async () => {
    const loginRes= await request(app).post("/api/auth/login").send({
      userName: "johndoe",
      password: "12345678",
    });
    const res = await request(app).post("/api/auth/force-logout").set("Authorization", studentAuthHeader).send({
      userId: loginRes.body.data.user.id,
    });
    expect(res.status).toBe(403);
  });

  test("Force logout successful", async () => {
    const loginRes= await request(app).post("/api/auth/login").send({
      userName: "johndoe",
      password: "12345678",
    });
    const res = await request(app).post("/api/auth/force-logout").set("Authorization", adminAuthHeader).send({
      userId: loginRes.body.data.user.id,
    });
    expect(res.status).toBe(200);
  });
});

describe("Disable user", () => {
  test("Disable user failed with non-admin user", async () => {
    const loginRes= await request(app).post("/api/auth/login").send({
      userName: "johndoe",
      password: "12345678",
    });
    const res = await request(app).post("/api/auth/disable-user").set("Authorization", studentAuthHeader).send({
      userId: loginRes.body.data.user.id,
    });
    expect(res.status).toBe(403);
  });

  test("Disable user successful", async () => {
    const loginRes= await request(app).post("/api/auth/login").send({
      userName: "johndoe",
      password: "12345678",
    });
    const res = await request(app).post("/api/auth/disable-user").set("Authorization", adminAuthHeader).send({
      userId: loginRes.body.data.user.id,
    });
    expect(res.status).toBe(200);
  });
});
