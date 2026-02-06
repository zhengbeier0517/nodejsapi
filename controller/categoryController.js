const categoryService = require('../service/categoryService');
const ok = (res, data = null, msg = 'success') => res.sendCommonValue(200, msg, data);

const getTree = async (req, res) => {
  const result = await categoryService.getTree();
  return ok(res, result.data);
};

const create = async (req, res) => {
  const result = await categoryService.create(req.body);
  return ok(res, result.data);
};

const update = async (req, res) => {
  const result = await categoryService.update(parseInt(req.params.id), req.body);
  return ok(res, result.data);
};

const remove = async (req, res) => {
  await categoryService.remove(parseInt(req.params.id));
  return ok(res);
};

const toggleActive = async (req, res) => {
  await categoryService.toggleActive(parseInt(req.params.id), req.body.active);
  return ok(res);
};

const updateSort = async (req, res) => {
  await categoryService.updateSort(parseInt(req.params.id), req.body.sortOrder);
  return ok(res);
};

module.exports = {
  getTree,
  create,
  update,
  remove,
  toggleActive,
  updateSort,
};
