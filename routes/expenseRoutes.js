
const express = require('express');
const router = express.Router();
const { authenticateAndAuthorize } = require('../middleware/authMiddleware');
const { addExpense } = require('../controllers/expenseController');

router.post('/add', authenticateAndAuthorize(['vendor']), addExpense);
// router.post('/return', authenticateAndAuthorize(['vendor']), returnPurchaseInvoice);
// router.get('/list/:id?', authenticateAndAuthorize(['admin', 'vendor']), getPurchaseInvoice);
// router.get('/vendor/list/:userId', authenticateAndAuthorize(['admin', 'vendor']), getPurchaseInvoicePartyWise);
// router.put('/update/:id', authenticateAndAuthorize(['admin', 'vendor']), updateServiceRate);

module.exports = router;