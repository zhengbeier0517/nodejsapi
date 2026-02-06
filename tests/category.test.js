const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../app");
const { jwtConfig } = require("../appConfig");
const { sequelize, Category } = require("../models");
const { sequelize: rawSequelize } = require("../db/sequelizedb");

// helper to sign an admin token using the same settings as authentication middleware
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

const authHeader = { Authorization: `Bearer ${adminToken}` };

const createCategory = async (payload) => {
  return request(app)
    .post("/api/category")
    .set(authHeader)
    .send(payload);
};

describe("Category API (auth + admin)", () => {
  const namesToCleanup = [];

  afterAll(async () => {
    if (namesToCleanup.length > 0) {
      await Category.destroy({ where: { name: namesToCleanup } });
    }
    await rawSequelize.close();
    await sequelize.close();
  });

  it("creates a category and returns in tree", async () => {
    const name = `Cat-${Date.now()}`;
    namesToCleanup.push(name);

    const resCreate = await createCategory({ name, sortOrder: 5 });
    expect(resCreate.status).toBe(200);
    expect(resCreate.body.isSuccess).toBe(true);
    const createdId = resCreate.body.data?.id;
    expect(createdId).toBeTruthy();

    const resTree = await request(app)
      .get("/api/category/tree")
      .set(authHeader);
    expect(resTree.status).toBe(200);
    const inTree = resTree.body.data.find((n) => n.name === name);
    expect(inTree).toBeTruthy();
  });

  it("updates, toggles active, updates sort, and deletes child then parent", async () => {
    const parentName = `Cat-P-${Date.now()}`;
    const childName = `Cat-C-${Date.now()}`;
    namesToCleanup.push(parentName, childName);

    // create parent
    const resParent = await createCategory({ name: parentName, sortOrder: 1 });
    const parentId = resParent.body.data.id;
    // create child
    const resChild = await createCategory({
      name: childName,
      parentId,
      sortOrder: 2,
    });
    const childId = resChild.body.data.id;

    // update parent
    const resUpdate = await request(app)
      .put(`/api/category/${parentId}`)
      .set(authHeader)
      .send({ description: "updated desc" });
    expect(resUpdate.status).toBe(200);

    // toggle active
    const resActive = await request(app)
      .patch(`/api/category/${parentId}/active`)
      .set(authHeader)
      .send({ active: false });
    expect(resActive.status).toBe(200);

    // update sort
    const resSort = await request(app)
      .patch(`/api/category/${parentId}/sort`)
      .set(authHeader)
      .send({ sortOrder: 10 });
    expect(resSort.status).toBe(200);

    // deleting parent should fail while child exists
    const resDeleteParentFail = await request(app)
      .delete(`/api/category/${parentId}`)
      .set(authHeader);
    expect(resDeleteParentFail.status).toBe(400);

    // delete child then parent succeeds
    const resDeleteChild = await request(app)
      .delete(`/api/category/${childId}`)
      .set(authHeader);
    expect(resDeleteChild.status).toBe(200);

    const resDeleteParent = await request(app)
      .delete(`/api/category/${parentId}`)
      .set(authHeader);
    expect(resDeleteParent.status).toBe(200);
  });
});
