const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const { commonValidate } = require('../middleware/expressValidator');
const { authenticate } = require('../middleware/authentication');
const { requireAdmin } = require('../middleware/authorization');
const upload = require('../middleware/upload');
const courseController = require('../controller/courseController');

/**
 * @openapi
 * /api/courses:
 *   get:
 *     tags:
 *       - Courses
 *     summary: List courses
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - name: pageSize
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - name: categoryId
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *       - name: teacherId
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/',
  authenticate,
  commonValidate([
    query('page').optional().isInt({ min: 1 }),
    query('pageSize').optional().isInt({ min: 1 }),
    query('categoryId').optional().isInt(),
    query('teacherId').optional().isInt()
  ]),
  courseController.getList
);

/**
 * @openapi
 * /api/courses/{id}:
 *   get:
 *     tags:
 *       - Courses
 *     summary: Get course details
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not Found
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/:id',
  authenticate,
  commonValidate([
    param('id').isInt({ min: 1 })
  ]),
  courseController.getOne
);

/**
 * @openapi
 * /api/courses:
 *   post:
 *     tags:
 *       - Courses
 *     summary: Create course (Admin Only)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: Introduction to Java Programming
 *               description:
 *                 type: string
 *                 example: Learn Java fundamentals from scratch
 *               categoryId:
 *                 type: integer
 *                 nullable: true
 *                 example: 1
 *                 description: Optional - Must be valid category ID from database
 *               teacherId:
 *                 type: integer
 *                 nullable: true
 *                 example: 2
 *                 description: Optional - Must be user ID with teacher role
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived]
 *                 default: draft
 *     responses:
 *       200:
 *         description: Created
 *       403:
 *         description: Forbidden (Admins only)
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/',
  authenticate,
  requireAdmin,
  commonValidate([
    body('title').notEmpty().trim().isLength({ max: 255 }),
    body('description').optional().isString(),
    body('categoryId').optional({ nullable: true }).isInt(),
    body('teacherId').optional({ nullable: true }).isInt(),
    body('status').optional().isIn(['draft', 'published', 'archived'])
  ]),
  courseController.create
);

/**
 * @openapi
 * /api/courses/{id}:
 *   put:
 *     tags:
 *       - Courses
 *     summary: Update course (Admin Only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Introduction to Java Programming
 *               description:
 *                 type: string
 *                 example: Learn Java fundamentals from scratch
 *               categoryId:
 *                 type: integer
 *                 nullable: true
 *                 example: 1
 *                 description: Optional - Must be valid category ID from database
 *               teacherId:
 *                 type: integer
 *                 nullable: true
 *                 example: 2
 *                 description: Optional - Must be user ID with teacher role
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived]
 *                 default: draft
 *               active:
 *                 type: boolean
 *               coverImage:
 *                 type: string
 *                 nullable: true
 *                 description: Cover image path (set to null to clear, or use POST /courses/:id/cover to upload new file)
 *     responses:
 *       200:
 *         description: Updated
 *       403:
 *         description: Forbidden (Admins only)
 *       401:
 *         description: Unauthorized
 */
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  commonValidate([
    param('id').isInt({ min: 1 }),
    body('title').optional().trim().isLength({ max: 255 }),
    body('description').optional().isString(),
    body('categoryId').optional({ nullable: true }).isInt(),
    body('teacherId').optional({ nullable: true }).isInt(),
    body('status').optional().isIn(['draft', 'published', 'archived']),
    body('active').optional().isBoolean(),
    body('coverImage').optional({ nullable: true }).isString().isLength({ max: 500 })
  ]),
  courseController.update
);

/**
 * @openapi
 * /api/courses/{id}:
 *   delete:
 *     tags:
 *       - Courses
 *     summary: Delete course (Admin Only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Deleted
 *       403:
 *         description: Forbidden (Admins only)
 *       401:
 *         description: Unauthorized
 */
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  commonValidate([
    param('id').isInt({ min: 1 })
  ]),
  courseController.remove
);

/**
 * @openapi
 * /api/courses/{id}/cover:
 *   post:
 *     tags:
 *       - Courses
 *     summary: Upload course cover (Admin Only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               coverImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Uploaded (Returns relative path)
 *       403:
 *         description: Forbidden (Admins only)
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/:id/cover',
  authenticate,
  requireAdmin,
  upload.single('coverImage'),
  courseController.uploadCover
);

module.exports = router;