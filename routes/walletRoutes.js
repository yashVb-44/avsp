// routes/vendorRoutes.js
const express = require('express');
const { addUserWallet, addNewUserParty, getAllParties, getUserPendingPayments, getUserParties, getVendorParties, addNewVendorParty, getVendorPendingPayments, addVendorWallet, getWalletListByType, getWalletToPayAndToCollect, getPartyDetails, updateParty } = require('../controllers/walletController');
const { authenticateAndAuthorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/add/amount', authenticateAndAuthorize(['vendor']), addUserWallet);
router.post('/add/vendor/amount', authenticateAndAuthorize(['vendor']), addVendorWallet);
router.post('/add/new/user', authenticateAndAuthorize(['vendor']), addNewUserParty);
router.post('/add/new/vendor', authenticateAndAuthorize(['vendor']), addNewVendorParty);
router.put('/update/party/:id', authenticateAndAuthorize(['vendor']), updateParty);
router.get('/parties/list', authenticateAndAuthorize(['vendor']), getAllParties);
router.get('/user/parties/list', authenticateAndAuthorize(['vendor']), getUserParties);
router.get('/vendor/parties/list', authenticateAndAuthorize(['vendor']), getVendorParties);
router.get('/user/invoice/payment/pending/list/:userId', authenticateAndAuthorize(['vendor']), getUserPendingPayments);
router.get('/vendor/invoice/payment/pending/list/:userId', authenticateAndAuthorize(['vendor']), getVendorPendingPayments);
router.post('/parties', authenticateAndAuthorize(['vendor']), getWalletListByType);
router.get('/to/payAndCollect', authenticateAndAuthorize(['vendor']), getWalletToPayAndToCollect);
router.get('/party-details/:customerId', authenticateAndAuthorize(['vendor']), getPartyDetails);

module.exports = router;
