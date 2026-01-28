const courseService = require('../service/courseService');
const { UserFriendlyException } = require('../common/commonError');
const logger = require('../common/logsetting');

// Helper functions for consistent response format
const ok = (res, data = null, msg = 'success') => res.sendCommonValue(200, msg, data);
const fail = (res, msg = 'fail', code = 400) => res.sendCommonValue(code, msg);

const getList = async (req, res) => {
  try {
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
  } catch (err) {
    logger.error('Course list error:', err);
    if (err instanceof UserFriendlyException) return fail(res, err.message);
    return fail(res, 'Failed to fetch courses', 500);
  }
};

const getOne = async (req, res) => {
  try {
    const result = await courseService.getOne(req.params.id);
    return ok(res, result.data);
  } catch (err) {
    logger.error('Course getOne error:', err);
    if (err instanceof UserFriendlyException) return fail(res, err.message, 404);
    return fail(res, 'Failed to fetch course', 500);
  }
};

const create = async (req, res) => {
  try {
    const result = await courseService.create(req.body);
    return ok(res, result.data, 'Course created successfully');
  } catch (err) {
    logger.error('Course create error:', err);

    // Handle user-friendly exceptions
    if (err instanceof UserFriendlyException) return fail(res, err.message);

    // Handle Sequelize foreign key constraint errors
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      if (err.message.includes('course_ibfk_1') || err.message.includes('categoryId')) {
        return fail(res, `Invalid categoryId: Category with ID ${req.body.categoryId} does not exist. Please use a valid category ID.`, 400);
      }
      if (err.message.includes('course_ibfk_2') || err.message.includes('teacherId')) {
        return fail(res, `Invalid teacherId: User with ID ${req.body.teacherId} does not exist. Please use a valid user ID.`, 400);
      }
      return fail(res, 'Invalid reference: One or more foreign key constraints failed.', 400);
    }

    // Handle other database errors
    if (err.name && err.name.startsWith('Sequelize')) {
      return fail(res, `Database error: ${err.message}`, 500);
    }

    // Generic error
    const errorMsg = process.env.NODE_ENV === 'production'
      ? 'Failed to create course'
      : `Failed to create course: ${err.message}`;
    return fail(res, errorMsg, 500);
  }
};

const update = async (req, res) => {
  try {
    const result = await courseService.update(req.params.id, req.body);
    return ok(res, result.data, 'Course updated successfully');
  } catch (err) {
    logger.error('Course update error:', err);

    // Handle user-friendly exceptions
    if (err instanceof UserFriendlyException) return fail(res, err.message);

    // Handle Sequelize foreign key constraint errors
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      if (err.message.includes('course_ibfk_1') || err.message.includes('categoryId')) {
        return fail(res, `Invalid categoryId: Category with ID ${req.body.categoryId} does not exist. Please use a valid category ID.`, 400);
      }
      if (err.message.includes('course_ibfk_2') || err.message.includes('teacherId')) {
        return fail(res, `Invalid teacherId: User with ID ${req.body.teacherId} does not exist. Please use a valid user ID.`, 400);
      }
      return fail(res, 'Invalid reference: One or more foreign key constraints failed.', 400);
    }

    // Handle other database errors
    if (err.name && err.name.startsWith('Sequelize')) {
      return fail(res, `Database error: ${err.message}`, 500);
    }

    // Generic error
    const errorMsg = process.env.NODE_ENV === 'production'
      ? 'Failed to update course'
      : `Failed to update course: ${err.message}`;
    return fail(res, errorMsg, 500);
  }
};

const remove = async (req, res) => {
  try {
    await courseService.remove(req.params.id);
    return ok(res, null, 'Course deleted successfully');
  } catch (err) {
    logger.error('Course delete error:', err);
    if (err instanceof UserFriendlyException) return fail(res, err.message);
    return fail(res, 'Failed to delete course', 500);
  }
};

const uploadCover = async (req, res) => {
  try {
    if (!req.file) {
      return fail(res, 'No file uploaded');
    }

    // Construct accessible URL path.
    // Should match how static files are served in app.js using express.static('public')
    // If app.js has: app.use(express.static(path.join(__dirname, 'public')));
    // Then the URL is /uploads/courses/filename.jpg
    const relativePath = '/uploads/courses/' + req.file.filename;

    const result = await courseService.updateCover(req.params.id, relativePath);
    return ok(res, result.data, 'Cover image uploaded successfully');
  } catch (err) {
    logger.error('Course cover upload error:', err);
    if (err instanceof UserFriendlyException) return fail(res, err.message);
    return fail(res, 'Failed to upload cover image', 500);
  }
};

module.exports = {
  getList,
  getOne,
  create,
  update,
  remove,
  uploadCover
};
