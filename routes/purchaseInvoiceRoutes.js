
const express = require('express');
const router = express.Router();
const { authenticateAndAuthorize } = require('../middleware/authMiddleware');
const { addPurchaseInvoice, returnPurchaseInvoice, getPurchaseInvoice, getPurchaseInvoicePartyWise } = require('../controllers/purchaseInvoiceController');

router.post('/add', authenticateAndAuthorize(['vendor']), addPurchaseInvoice);
router.post('/return', authenticateAndAuthorize(['vendor']), returnPurchaseInvoice);
router.get('/list/:id?', authenticateAndAuthorize(['admin', 'vendor']), getPurchaseInvoice);
router.get('/vendor/list/:userId', authenticateAndAuthorize(['admin', 'vendor']), getPurchaseInvoicePartyWise);
// router.put('/update/:id', authenticateAndAuthorize(['admin', 'vendor']), updateServiceRate);

module.exports = router;