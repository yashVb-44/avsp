// routes/vendorRoutes.js
const express = require('express');
const { addUserWallet , addNewParty, getAllParties} = require('../controllers/walletController');
const { authenticateAndAuthorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/add/amount', authenticateAndAuthorize(['vendor']), addUserWallet);
router.post('/add/new/user', authenticateAndAuthorize(['vendor']), addNewParty);
router.get('/user/list', authenticateAndAuthorize(['vendor']), getAllParties);

module.exports = router;
