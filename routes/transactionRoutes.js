// routes/vendorRoutes.js
const express = require('express');
const { getVendorAllTransaction } = require('../controllers/transactionController');
const { authenticateAndAuthorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/all', authenticateAndAuthorize(['vendor']), getVendorAllTransaction);

module.exports = router;
