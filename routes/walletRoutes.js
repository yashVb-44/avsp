// routes/vendorRoutes.js
const express = require('express');
const { addUserWallet, addNewUserParty, getAllParties, getUserPendingPayments, getUserParties, getVendorParties } = require('../controllers/walletController');
const { authenticateAndAuthorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/add/amount', authenticateAndAuthorize(['vendor']), addUserWallet);
router.post('/add/new/user', authenticateAndAuthorize(['vendor']), addNewUserParty);
router.get('/parties/list', authenticateAndAuthorize(['vendor']), getAllParties);
router.get('/user/parties/list', authenticateAndAuthorize(['vendor']), getUserParties);
router.get('/vendor/parties/list', authenticateAndAuthorize(['vendor']), getVendorParties);
router.get('/user/invoice/payment/pending/list/:userId', authenticateAndAuthorize(['vendor']), getUserPendingPayments);

module.exports = router;
