
const express = require('express');
const router = express.Router();
const { authenticateAndAuthorize } = require('../middleware/authMiddleware');
const { addServiceReminder } = require('../controllers/serviceReminderController');

router.post('/add', authenticateAndAuthorize(['vendor']), addServiceReminder);

module.exports = router;