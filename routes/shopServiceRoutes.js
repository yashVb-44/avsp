const express = require('express');
const router = express.Router();
const { createService, getServices, getServicesForUser } = require('../controllers/shopServiceController');
const { authenticateAndAuthorize } = require('../middleware/authMiddleware');


router.post('/create', authenticateAndAuthorize(['admin', 'vendor', 'user']), createService);
router.get('/', authenticateAndAuthorize(['admin', 'vendor', 'user']), getServices);
router.get('/forUser', authenticateAndAuthorize(['user']), getServicesForUser);

module.exports = router;
