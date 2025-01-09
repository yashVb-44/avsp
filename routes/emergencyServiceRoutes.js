const express = require('express');
const router = express.Router();
const { createService, getServices, getServicesForUser, updateService, getServicesForAdmin } = require('../controllers/emergencyServiceController');
const { authenticateAndAuthorize } = require('../middleware/authMiddleware');


router.post('/create', authenticateAndAuthorize(['admin', 'vendor']), createService);
router.put('/update/:shopServiceId', authenticateAndAuthorize(['admin', 'vendor']), updateService);
router.get('/list/forAdmin', authenticateAndAuthorize(['admin']), getServicesForAdmin);
router.get('/', authenticateAndAuthorize(['admin', 'vendor']), getServices);
router.get('/forUser', authenticateAndAuthorize(['user']), getServicesForUser);

module.exports = router;
