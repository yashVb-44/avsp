
const express = require('express');
const router = express.Router();
const { authenticateAndAuthorize } = require('../middleware/authMiddleware');
const { getTodayStats, getAdminDashboardStats } = require('../controllers/homePageController');

router.get('/todayStats', authenticateAndAuthorize(['vendor']), getTodayStats);
router.get('/dashboard/stats', authenticateAndAuthorize(['admin']), getAdminDashboardStats);

module.exports = router;