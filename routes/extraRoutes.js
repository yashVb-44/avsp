
const express = require('express');
const router = express.Router();
const { authenticateAndAuthorize } = require('../middleware/authMiddleware');
const { deleteAllData } = require('../controllers/extraController');

router.delete('/', authenticateAndAuthorize(['admin']), deleteAllData);

module.exports = router;