const express = require('express');
const router = express.Router();
const controller = require('../controller/courseContentController'); // 确认文件夹名是 controller 还是 controllers

/**
 * @swagger
 * tags:
 * name: CourseContents
 * description: Course Content Management
 */

/**
 * @swagger
 * /api/course-contents/list:
 * get:
 * summary: Get Content List
 * tags: [CourseContents]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: query
 * name: courseId
 * schema:
 * type: integer
 * description: Class ID
 * responses:
 * 200:
 * description: Success
 * 401:
 * description: Unauthorized
 */
router.get('/list', controller.getContents);

module.exports = router;