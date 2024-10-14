
const express = require('express');
const router = express.Router();
const { authenticateAndAuthorize } = require('../middleware/authMiddleware');
const { addSaleInvoice, getSaleInvoice, returnSaleInvoice, getSaleInvoicePartyWise } = require('../controllers/saleInvoiceController');

router.post('/add', authenticateAndAuthorize(['vendor']), addSaleInvoice);
router.post('/return', authenticateAndAuthorize(['vendor']), returnSaleInvoice);
router.get('/list/:id?', authenticateAndAuthorize(['admin', 'vendor']), getSaleInvoice);
router.get('/user/list/:userId', authenticateAndAuthorize(['admin', 'vendor']), getSaleInvoicePartyWise);
// router.put('/update/:id', authenticateAndAuthorize(['admin', 'vendor']), updateServiceRate);

module.exports = router;