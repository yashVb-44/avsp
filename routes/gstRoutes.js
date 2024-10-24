
const express = require('express');
const router = express.Router();
const { authenticateAndAuthorize } = require('../middleware/authMiddleware');
const { addGst, getGst, updateGst, deleteGst } = require('../controllers/gstController');

router.post('/add', authenticateAndAuthorize(['admin']), addGst);
router.get('/:id?', authenticateAndAuthorize(['admin', 'vendor']), getGst);
router.put('/update/:id', authenticateAndAuthorize(['admin']), updateGst);
router.delete('/:id?', authenticateAndAuthorize(['admin']), deleteGst);

module.exports = router;