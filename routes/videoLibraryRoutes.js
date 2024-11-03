
const express = require('express');
const router = express.Router();
const { authenticateAndAuthorize } = require('../middleware/authMiddleware');
const { addVideo, getAllVideos, updateVideo, deleteVideo } = require('../controllers/videoLibraryController');

router.post('/add', authenticateAndAuthorize(['admin']), addVideo);
router.get('/:id?', authenticateAndAuthorize(['admin', 'vendor']), getAllVideos);
router.put('/update/:videoId', authenticateAndAuthorize(['admin']), updateVideo);
router.delete('/:videoId?', authenticateAndAuthorize(['admin']), deleteVideo);

module.exports = router;