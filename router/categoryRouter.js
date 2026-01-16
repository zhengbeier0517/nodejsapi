const express = require('express');
const { body, param } = require('express-validator');
const { commonValidate } = require('../middleware/expressValidator');
const categoryController = require('../controller/categoryController');

const router = express.Router();

router.get('/tree', categoryController.getTree);

router.post(
  '/',
  commonValidate([
    body('name').notEmpty().withMessage('name is required'),
    body('parentId').optional({ nullable: true }).isInt({ min: 1 }).withMessage('parentId must be int'),
    body('sortOrder').optional().isInt(),
    body('status').optional().isIn(['Enabled', 'Disabled']),
  ]),
  categoryController.create
);

router.put(
  '/:id',
  commonValidate([
    param('id').isInt({ min: 1 }),
    body('name').optional().isString(),
    body('parentId').optional({ nullable: true }).isInt({ min: 1 }),
    body('sortOrder').optional().isInt(),
    body('status').optional().isIn(['Enabled', 'Disabled']),
  ]),
  categoryController.update
);

router.delete('/:id', commonValidate([param('id').isInt({ min: 1 })]), categoryController.remove);

router.patch(
  '/:id/status',
  commonValidate([
    param('id').isInt({ min: 1 }),
    body('status').isIn(['Enabled', 'Disabled']).withMessage('status must be Enabled or Disabled'),
  ]),
  categoryController.toggleStatus
);

router.patch(
  '/:id/sort',
  commonValidate([
    param('id').isInt({ min: 1 }),
    body('sortOrder').isInt().withMessage('sortOrder required'),
  ]),
  categoryController.updateSort
);

module.exports = router;
