const categoryService = require('../service/categoryService');
const { UserFriendlyException } = require('../common/commonError');

const ok = (res, data = null, msg = 'success') => res.sendCommonValue(200, msg, data);
const fail = (res, msg = 'fail', code = 400) => res.sendCommonValue(code, msg);

const getTree = async (req, res) => {
  const result = await categoryService.getTree();
  return ok(res, result.data);
};

const create = async (req, res) => {
  try {
    const result = await categoryService.create(req.body);
    return ok(res, result.data);
  } catch (err) {
    if (err instanceof UserFriendlyException) return fail(res, err.message);
    return fail(res, 'create failed');
  }
};

const update = async (req, res) => {
  try {
    const result = await categoryService.update(parseInt(req.params.id), req.body);
    return ok(res, result.data);
  } catch (err) {
    if (err instanceof UserFriendlyException) return fail(res, err.message);
    return fail(res, 'update failed');
  }
};

const remove = async (req, res) => {
  try {
    await categoryService.remove(parseInt(req.params.id));
    return ok(res);
  } catch (err) {
    if (err instanceof UserFriendlyException) return fail(res, err.message);
    return fail(res, 'delete failed');
  }
};

const toggleStatus = async (req, res) => {
  try {
    await categoryService.toggleStatus(parseInt(req.params.id), req.body.status);
    return ok(res);
  } catch (err) {
    if (err instanceof UserFriendlyException) return fail(res, err.message);
    return fail(res, 'status update failed');
  }
};

const updateSort = async (req, res) => {
  try {
    await categoryService.updateSort(parseInt(req.params.id), req.body.sortOrder);
    return ok(res);
  } catch (err) {
    if (err instanceof UserFriendlyException) return fail(res, err.message);
    return fail(res, 'sort update failed');
  }
};

module.exports = {
  getTree,
  create,
  update,
  remove,
  toggleStatus,
  updateSort,
};
