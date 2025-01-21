const express = require('express');
const router = express.Router();
const { authenticateAndAuthorize } = require('../middleware/authMiddleware');
const { addBanner, getBanners, updateBanner, deleteBanner, getBannerForAdmin } = require('../controllers/bannerController');

router.post('/add', authenticateAndAuthorize(['admin']), addBanner);
router.get('/:id?', authenticateAndAuthorize(['admin', 'user', 'vendor']), getBanners);
router.get('/list/forAdmin', authenticateAndAuthorize(['admin']), getBannerForAdmin);
router.put('/update/:id', authenticateAndAuthorize(['admin']), updateBanner);
router.delete('/delete/:id?', authenticateAndAuthorize(['admin']), deleteBanner);

module.exports = router;