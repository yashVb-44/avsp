// routes/userRoutes.js
const express = require('express');
const { register, verifyOtp, sendOtp } = require('../controllers/authController');
const { updateUserProfile, getUserProfile } = require('../controllers/userController');
const { authenticateAndAuthorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', register);
router.post('/verifyOtp', verifyOtp);
router.post('/sendOtp', sendOtp);
router.get('/profile/:id?', authenticateAndAuthorize(['user', 'admin']), getUserProfile);
router.put('/profile/:id?', authenticateAndAuthorize(['user', 'admin']), updateUserProfile);

module.exports = router;
