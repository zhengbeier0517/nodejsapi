const express = require('express');
const router = express.Router();
const controller = require('../controllers/courseContentController');

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
 * description: 
 * 401:
 * description: 
 */
router.get('/list', controller.getContents);

module.exports = router;