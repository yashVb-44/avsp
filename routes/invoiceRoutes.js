
const express = require('express');
const router = express.Router();
const { authenticateAndAuthorize } = require('../middleware/authMiddleware');
const { generateInvoiceHTML, getPartyInvoicesByVendor, getTransactionsByInvoice } = require('../controllers/invoiceController');

router.get('/html/:id', generateInvoiceHTML);
router.get('/partyWise/byVendor/:partyId', authenticateAndAuthorize(['vendor', 'admin']), getPartyInvoicesByVendor);
router.get('/transactions/byVendor/:invoiceId', authenticateAndAuthorize(['vendor', 'admin']), getTransactionsByInvoice);

module.exports = router;