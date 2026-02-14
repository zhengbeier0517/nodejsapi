const { initDB, closeDB, initRole } = require("./testHelper");

beforeAll(async () => {
  await initDB();
  await initRole();
});

afterAll(async () => {
  await closeDB();
});
