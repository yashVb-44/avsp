// routes/vendorRoutes.js
const express = require('express');
const { getVendorAllTransaction, getAllTransactionWithFilter, getPartyTransactionsByVendor, getCounterSaleTransactionsTypeWise, getVendorTransactionDetails } = require('../controllers/transactionController');
const { authenticateAndAuthorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/all', authenticateAndAuthorize(['vendor']), getVendorAllTransaction);
router.get('/details/:transactionId', authenticateAndAuthorize(['vendor']), getVendorTransactionDetails);
router.post('/filterWise', authenticateAndAuthorize(['vendor']), getAllTransactionWithFilter);
router.get('/partyWise/:partyId', authenticateAndAuthorize(['vendor']), getPartyTransactionsByVendor);
router.get('/of/counter/typeWise', authenticateAndAuthorize(['vendor']), getCounterSaleTransactionsTypeWise);

module.exports = router;
