
const express = require('express');
const router = express.Router();
const { authenticateAndAuthorize } = require('../middleware/authMiddleware');
const { addSaleInvoice, getSaleInvoice, returnSaleInvoice, getSaleInvoicePartyWise, counterSaleInvoice, deleteSaleInvoice, counterSaleReturnInvoice, getCounterSaleInvoice } = require('../controllers/saleInvoiceController');

router.post('/add', authenticateAndAuthorize(['vendor']), addSaleInvoice);
router.post('/return', authenticateAndAuthorize(['vendor']), returnSaleInvoice);
router.post('/counter', authenticateAndAuthorize(['vendor']), counterSaleInvoice);
router.post('/counter/return', authenticateAndAuthorize(['vendor']), counterSaleReturnInvoice);
router.get('/list/:id?', authenticateAndAuthorize(['admin', 'vendor']), getSaleInvoice);
router.get('/counter/list', authenticateAndAuthorize(['vendor']), getCounterSaleInvoice);
router.get('/user/list/:userId', authenticateAndAuthorize(['admin', 'vendor']), getSaleInvoicePartyWise);
router.delete('/list/delete/:id?', authenticateAndAuthorize(['admin', 'vendor']), deleteSaleInvoice);
// router.put('/update/:id', authenticateAndAuthorize(['admin', 'vendor']), updateServiceRate);

module.exports = router;