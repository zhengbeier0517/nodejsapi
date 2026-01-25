const express = require('express');
const { body, param } = require('express-validator');
const { commonValidate } = require('../middleware/expressValidator');
const categoryController = require('../controller/categoryController');

const router = express.Router();

/**
 * @openapi
 * /api/category/tree:
 *   get:
 *     tags:
 *       - Category
 *     summary: Get category tree
 *     responses:
 *       200:
 *         description: Tree data
 */
router.get('/tree', categoryController.getTree);

/**
 * @openapi
 * /api/category:
 *   post:
 *     tags:
 *       - Category
 *     summary: Create category
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               parentId:
 *                 type: integer
 *                 nullable: true
 *               sortOrder:
 *                 type: integer
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Created
 *       400:
 *         description: Validation failed
 */
router.post(
  '/',
  commonValidate([
    body('name').notEmpty().withMessage('name is required'),
    body('parentId').optional({ nullable: true }).isInt({ min: 1 }).withMessage('parentId must be int'),
    body('sortOrder').optional().isInt(),
    body('active').optional().isBoolean(),
  ]),
  categoryController.create
);

/**
 * @openapi
 * /api/category/{id}:
 *   put:
 *     tags:
 *       - Category
 *     summary: Update category
 *     parameters:
 *       - in: path
 *         name: id
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               parentId:
 *                 type: integer
 *                 nullable: true
 *               sortOrder:
 *                 type: integer
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Updated
 *       400:
 *         description: Validation failed
 */
router.put(
  '/:id',
  commonValidate([
    param('id').isInt({ min: 1 }),
    body('name').optional().isString(),
    body('parentId').optional({ nullable: true }).isInt({ min: 1 }),
    body('sortOrder').optional().isInt(),
    body('active').optional().isBoolean(),
  ]),
  categoryController.update
);

/**
 * @openapi
 * /api/category/{id}:
 *   delete:
 *     tags:
 *       - Category
 *     summary: Delete category
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Deleted
 *       400:
 *         description: Cannot delete (has children)
 */
router.delete('/:id', commonValidate([param('id').isInt({ min: 1 })]), categoryController.remove);

/**
 * @openapi
 * /api/category/{id}/active:
 *   patch:
 *     tags:
 *       - Category
 *     summary: Toggle active
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [active]
 *             properties:
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Updated
 *       400:
 *         description: Validation failed
 */
router.patch(
  '/:id/active',
  commonValidate([
    param('id').isInt({ min: 1 }),
    body('active').isBoolean().withMessage('active must be boolean'),
  ]),
  categoryController.toggleActive
);

/**
 * @openapi
 * /api/category/{id}/sort:
 *   patch:
 *     tags:
 *       - Category
 *     summary: Update sort order
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [sortOrder]
 *             properties:
 *               sortOrder:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Updated
 *       400:
 *         description: Validation failed
 */
router.patch(
  '/:id/sort',
  commonValidate([
    param('id').isInt({ min: 1 }),
    body('sortOrder').isInt().withMessage('sortOrder required'),
  ]),
  categoryController.updateSort
);

module.exports = router;
