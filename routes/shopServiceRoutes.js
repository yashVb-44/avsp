const express = require('express');
const router = express.Router();
const { createService, getServices, getServicesForUser, getServicesForAdmin, updateService } = require('../controllers/shopServiceController');
const { authenticateAndAuthorize } = require('../middleware/authMiddleware');


router.post('/create', authenticateAndAuthorize(['admin', 'vendor', 'user']), createService);
router.put('/update/:shopServiceId', authenticateAndAuthorize(['admin', 'vendor']), updateService);
router.get('/list/forAdmin', authenticateAndAuthorize(['admin']), getServicesForAdmin);
router.get('/', authenticateAndAuthorize(['admin', 'vendor', 'user']), getServices);
router.get('/forUser', authenticateAndAuthorize(['user']), getServicesForUser);

module.exports = router;
