// routes/vendorRoutes.js
const express = require('express');
const { getVendorAllTransaction, getAllTransactionWithFilter, getPartyTransactionsByVendor, getCounterSaleTransactionsTypeWise } = require('../controllers/transactionController');
const { authenticateAndAuthorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/all', authenticateAndAuthorize(['vendor']), getVendorAllTransaction);
router.post('/filterWise', authenticateAndAuthorize(['vendor']), getAllTransactionWithFilter);
router.get('/partyWise/:partyId', authenticateAndAuthorize(['vendor']), getPartyTransactionsByVendor);
router.get('/of/counter/typeWise', authenticateAndAuthorize(['vendor']), getCounterSaleTransactionsTypeWise);

module.exports = router;
