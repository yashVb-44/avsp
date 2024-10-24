// routes/vendorRoutes.js
const express = require('express');
const { getVendorAllTransaction, getAllTransactionWithFilter } = require('../controllers/transactionController');
const { authenticateAndAuthorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/all', authenticateAndAuthorize(['vendor']), getVendorAllTransaction);
router.post('/filterWise', authenticateAndAuthorize(['vendor']), getAllTransactionWithFilter);

module.exports = router;
