const express = require('express');
const router = express.Router();
const { authenticateAndAuthorize } = require('../middleware/authMiddleware');
const { uploadGallery, getGallery, updateGallery } = require('../controllers/shopGalleryController');

router.post('/upload', authenticateAndAuthorize(['admin', 'vendor']), uploadGallery);
router.get('/:id?', authenticateAndAuthorize(['admin', 'vendor']), getGallery);
router.put('/update/:id', authenticateAndAuthorize(['admin', 'vendor']), updateGallery);

module.exports = router;