const express = require('express');
const router = express.Router();
const controller = require('../controllers/courseContentController');

router.get('/list', controller.getContents);

module.exports = router;