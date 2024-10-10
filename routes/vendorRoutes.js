// routes/vendorRoutes.js
const express = require('express');
const { register, verifyOtp, sendOtp } = require('../controllers/authController');
const { getVendorProfile, updateVendorProfile, filterVendors, vendorDetails } = require('../controllers/vendorController');
const { authenticateAndAuthorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', register);
router.post('/verifyOtp', verifyOtp);
router.post('/sendOtp', sendOtp);
router.get('/profile/:id?', authenticateAndAuthorize(['vendor', 'admin']), getVendorProfile);
router.put('/profile/:id?', authenticateAndAuthorize(['vendor', 'admin']), updateVendorProfile);
router.post('/filter', authenticateAndAuthorize(['user']), filterVendors);
router.post('/details/:id?', authenticateAndAuthorize(['user']), vendorDetails);

module.exports = router;
