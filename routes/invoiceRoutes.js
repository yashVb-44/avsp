
const express = require('express');
const router = express.Router();
const { authenticateAndAuthorize } = require('../middleware/authMiddleware');
const { generateInvoiceHTML } = require('../controllers/invoiceController');

router.get('/html/:id', generateInvoiceHTML);

module.exports = router;