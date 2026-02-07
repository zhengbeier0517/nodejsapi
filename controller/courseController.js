const courseService = require('../service/courseService');
const { UserFriendlyException } = require('../common/commonError');

// Helper functions for consistent response format
const ok = (res, data = null, msg = 'success') => res.sendCommonValue(200, msg, data);

const getList = async (req, res) => {
    const page = req.query.page || 1;
    const pageSize = req.query.pageSize || 10;
    const filters = {
        title: req.query.title,
        status: req.query.status,
        categoryId: req.query.categoryId,
        teacherId: req.query.teacherId,
        active: req.query.active
    };

    const result = await courseService.getList(page, pageSize, filters);
    return ok(res, result.data);
};

const getOne = async (req, res) => {
    const result = await courseService.getOne(req.params.id);
    return ok(res, result.data);
};

const create = async (req, res) => {
    const result = await courseService.create(req.body);
    return ok(res, result.data, 'Course created successfully');
};

const update = async (req, res) => {
    const result = await courseService.update(req.params.id, req.body);
    return ok(res, result.data, 'Course updated successfully');
};

const remove = async (req, res) => {
    await courseService.remove(req.params.id);
    return ok(res, null, 'Course deleted successfully');
};

const uploadCover = async (req, res) => {
    if (!req.file) {
        throw new UserFriendlyException('No file uploaded');
    }

    // Construct accessible URL path.
    const relativePath = '/uploads/courses/' + req.file.filename;

    const result = await courseService.updateCover(req.params.id, relativePath);
    return ok(res, result.data, 'Cover image uploaded successfully');
};

module.exports = {
  getList,
  getOne,
  create,
  update,
  remove,
  uploadCover
};