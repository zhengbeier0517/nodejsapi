const CourseContent = require('../models/CourseContent');

exports.findAllContents = async () => {
  return await CourseContent.findAll();
};