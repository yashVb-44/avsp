
const express = require('express');
const router = express.Router();
const { authenticateAndAuthorize } = require('../middleware/authMiddleware');
const { addServiceRate, getServiceRate, updateServiceRate } = require('../controllers/serviceRateController');

router.post('/add', authenticateAndAuthorize(['admin', 'vendor']), addServiceRate);
router.get('/:id?', authenticateAndAuthorize(['admin', 'vendor']), getServiceRate);
router.put('/update/:id', authenticateAndAuthorize(['admin', 'vendor']), updateServiceRate);

module.exports = router;