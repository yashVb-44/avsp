// routes/vendorRoutes.js
const express = require('express');
const { addUserWallet } = require('../controllers/walletController');
const { authenticateAndAuthorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/add/amount', authenticateAndAuthorize(['vendor']), addUserWallet);

module.exports = router;
