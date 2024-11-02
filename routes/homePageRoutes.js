
const express = require('express');
const router = express.Router();
const { authenticateAndAuthorize } = require('../middleware/authMiddleware');
const { getTodayStats } = require('../controllers/homePageController');

router.get('/todayStats', authenticateAndAuthorize(['vendor']), getTodayStats);

module.exports = router;