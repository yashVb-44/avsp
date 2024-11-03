
const express = require('express');
const router = express.Router();
const { authenticateAndAuthorize } = require('../middleware/authMiddleware');
const { addServiceReminder, getServiceReminders, deleteServiceReminder } = require('../controllers/serviceReminderController');

router.post('/add', authenticateAndAuthorize(['vendor']), addServiceReminder);
router.get('/calendarWise', authenticateAndAuthorize(['vendor']), getServiceReminders);
router.delete('/:reminderId', authenticateAndAuthorize(['vendor']), deleteServiceReminder);

module.exports = router;