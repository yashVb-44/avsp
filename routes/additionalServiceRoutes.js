
const express = require('express');
const router = express.Router();
const { authenticateAndAuthorize } = require('../middleware/authMiddleware');
const { addAdditionalService, getAdditionalService, updateAdditionalService } = require('../controllers/additionalServiceController');

router.post('/add', authenticateAndAuthorize(['admin', 'vendor']), addAdditionalService);
router.get('/:id?', authenticateAndAuthorize(['admin', 'vendor']), getAdditionalService);
router.put('/update/:id', authenticateAndAuthorize(['admin', 'vendor']), updateAdditionalService);

module.exports = router;