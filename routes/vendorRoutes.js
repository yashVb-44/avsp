// routes/vendorRoutes.js
const express = require('express');
const { register, verifyOtp, sendOtp } = require('../controllers/authController');
const { getVendorProfile, updateVendorProfile, filterVendors, vendorDetails, deActiveVendorAccount, deleteVendorAccount, getVendorsForAdmin, getVendorSubscriptionDetails } = require('../controllers/vendorController');
const { authenticateAndAuthorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', register);
router.post('/verifyOtp', verifyOtp);
router.post('/sendOtp', sendOtp);
router.get('/profile/:id?', authenticateAndAuthorize(['vendor', 'admin']), getVendorProfile);
router.put('/profile/:id?', authenticateAndAuthorize(['vendor', 'admin']), updateVendorProfile);
router.get('/subscription/details', authenticateAndAuthorize(['vendor']), getVendorSubscriptionDetails);
router.get('/list/forAdmin', authenticateAndAuthorize(['admin']), getVendorsForAdmin);
router.post('/filter', authenticateAndAuthorize(['user']), filterVendors);
router.post('/details/:id?', authenticateAndAuthorize(['user']), vendorDetails);
router.post('/account/deActivate', authenticateAndAuthorize(['vendor']), deActiveVendorAccount);
router.delete('/account/delete', authenticateAndAuthorize(['vendor']), deleteVendorAccount);

module.exports = router;
