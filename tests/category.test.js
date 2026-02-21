const request = require("supertest");
const app = require("../app");
const { Category } = require("../models");
const { adminAuthHeader } = require("./testHelper");

const createCategory = async (payload) => {
  return request(app)
    .post("/api/category")
    .set("Authorization", adminAuthHeader)
    .send(payload);
};

describe("Category API (auth + admin)", () => {
  const namesToCleanup = [];

  afterAll(async () => {
    if (namesToCleanup.length > 0) {
      await Category.destroy({ where: { name: namesToCleanup } });
    }
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
      .set("Authorization", adminAuthHeader)
      .send({ description: "updated desc" });
    expect(resUpdate.status).toBe(200);

    // toggle active
    const resActive = await request(app)
      .patch(`/api/category/${parentId}/active`)
      .set("Authorization", adminAuthHeader)
      .send({ active: false });
    expect(resActive.status).toBe(200);

    // update sort
    const resSort = await request(app)
      .patch(`/api/category/${parentId}/sort`)
      .set("Authorization", adminAuthHeader)
      .send({ sortOrder: 10 });
    expect(resSort.status).toBe(200);

    // deleting parent should fail while child exists
    const resDeleteParentFail = await request(app)
      .delete(`/api/category/${parentId}`)
      .set("Authorization", adminAuthHeader);
    expect(resDeleteParentFail.status).toBe(400);

    // delete child then parent succeeds
    const resDeleteChild = await request(app)
      .delete(`/api/category/${childId}`)
      .set("Authorization", adminAuthHeader);
    expect(resDeleteChild.status).toBe(200);

    const resDeleteParent = await request(app)
      .delete(`/api/category/${parentId}`)
      .set("Authorization", adminAuthHeader);
    expect(resDeleteParent.status).toBe(200);
  });
});
