const express = require('express');
const router = express.Router();
const { createService, getServices, getServicesForUser } = require('../controllers/emergencyServiceController');
const { authenticateAndAuthorize } = require('../middleware/authMiddleware');


router.post('/create', authenticateAndAuthorize(['admin', 'vendor']), createService);
router.get('/', authenticateAndAuthorize(['admin', 'vendor']), getServices);
router.get('/forUser', authenticateAndAuthorize(['user']), getServicesForUser);

module.exports = router;
