const express = require('express');
const router = express.Router();
const controller = require('../controller/courseContentController');

/**
 * @openapi
 * /api/course-contents/list:
 *   get:
 *     tags:
 *       - Course Contents
 *     summary: Get course content list
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: courseId
 *         in: query
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Content list returned successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.get('/list', controller.getContents);

module.exports = router;
