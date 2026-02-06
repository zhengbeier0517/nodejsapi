const app = require("../app");
const request = require("supertest");

let accessToken = "";
let refreshToken = "";

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
});

describe("Login", () => {
  test("Login successful", async () => {
    const res = await request(app).post("/api/auth/login").send({
      userName: "johndoe",
      password: "12345678",
    });
    expect(res.status).toBe(200);
    accessToken = res.body.data.accessToken;
    refreshToken = res.body.data.refreshToken;
  });
});

describe("Refresh", () => {
  test("Refresh successful", async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1s to ensure the new access token is different from the old one
    const res = await request(app).post("/api/auth/refresh").set("Authorization", `Bearer ${accessToken}`).send({
      refreshToken,
    });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).not.toBe(accessToken);
    expect(res.body.data.refreshToken).toBe(refreshToken);
    accessToken = res.body.data.accessToken;
  });
});

describe("Logout", () => {
  test("Logout successful", async () => {
    const res = await request(app).post("/api/auth/logout").set("Authorization", `Bearer ${accessToken}`).send({
      refreshToken,
    });
    expect(res.status).toBe(204);
  });
});
