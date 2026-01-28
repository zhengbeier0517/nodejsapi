const express = require('express');
const router = express.Router();
const controller = require('../controller/courseContentController');

/**
 * @swagger
 * tags:
 * name: CourseContents
 * description: Course Content Management
 */

/**
 * @swagger
 * /api/course-contents/list:
 *   get:  
 *     summary: Get Content List    
 * tags: [CourseContents]
 * security:
 * - BearerAuth: []
 *     parameters:
 *       - in: query
 * name: courseId
 * required: true
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