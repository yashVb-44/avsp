// routes/userRoutes.js
const express = require('express');
const { register, verifyOtp, sendOtp } = require('../controllers/authController');
const { updateUserProfile, getUserProfile, getUserListWithMobileNo, addUserByVendor, getUsersForAdmin, deleteUser } = require('../controllers/userController');
const { authenticateAndAuthorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', register);
router.post('/verifyOtp', verifyOtp);
router.post('/sendOtp', sendOtp);
router.post('/add/byVendor', addUserByVendor);
router.get('/profile/:id?', authenticateAndAuthorize(['user', 'admin']), getUserProfile);
router.get('/list/byMobileNo', authenticateAndAuthorize(['vendor', 'admin']), getUserListWithMobileNo);
router.get('/list/forAdmin', authenticateAndAuthorize(['admin']), getUsersForAdmin);
router.put('/profile/:id?', authenticateAndAuthorize(['user', 'admin']), updateUserProfile);
router.get('/details/:id', authenticateAndAuthorize(['user', 'admin']), updateUserProfile);
router.delete('/byAdmin/:id', authenticateAndAuthorize(['admin']), deleteUser);

module.exports = router;
