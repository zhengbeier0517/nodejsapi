const CourseContent = require('../models/CourseContent'); 

exports.findAllContents = async (courseId) => {
  const queryOptions = {
    order: [['sortOrder', 'ASC']]
  };

  if (courseId) {
    queryOptions.where = { courseId: courseId };
  }

  return await CourseContent.findAll(queryOptions);
};