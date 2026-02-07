const logger = require("../common/logsetting");

const errorhandling = (err, req, res, next) => {
  logger.error("global errorhandling", err);
  if (err.name === "UnauthorizedError") {
    return res.sendCommonValue(401, "Unauthorized");
  }

  if (err.name === "EntityNotFoundException" ||
    err.name === "EntityAlreadyExistsException" ||
    err.name === "UserFriendlyException" ||
    err.name === "ValidationException"
  ) {
    return res.sendCommonValue(err.statusCode, err.message);
  }

  // Handle Sequelize foreign key constraint errors
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    if (err.message && (err.message.includes('course_ibfk_1') || err.message.includes('categoryId'))) {
      const categoryId = req.body && req.body.categoryId ? req.body.categoryId : 'provided';
      return res.sendCommonValue(400, `Invalid categoryId: Category with ID ${categoryId} does not exist. Please use a valid category ID.`);
    }
    if (err.message && (err.message.includes('course_ibfk_2') || err.message.includes('teacherId'))) {
      const teacherId = req.body && req.body.teacherId ? req.body.teacherId : 'provided';
      return res.sendCommonValue(400, `Invalid teacherId: User with ID ${teacherId} does not exist. Please use a valid user ID.`);
    }
    return res.sendCommonValue(400, 'Invalid reference: One or more foreign key constraints failed.');
  }

  // Handle other database errors
  if (err.name && err.name.startsWith('Sequelize')) {
    return res.sendCommonValue(500, `Database error: ${err.message}`);
  }

  if (err && err.sql) {
    return res.sendCommonValue(500, "server error");
  }
  res.sendCommonValue(500, err);
};

module.exports = {
  errorhandling,
};
