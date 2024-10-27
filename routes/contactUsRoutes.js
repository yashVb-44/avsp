
const express = require('express');
const router = express.Router();
const { authenticateAndAuthorize } = require('../middleware/authMiddleware');
const { addContactUs, getContactUs, updateContactUs, deleteContactUs } = require('../controllers/contactUsController');

router.post('/add', authenticateAndAuthorize(['user', 'vendor']), addContactUs);
router.get('/:id?', authenticateAndAuthorize(['admin', 'user', 'vendor']), getContactUs);
router.put('/update/:id', authenticateAndAuthorize(['admin']), updateContactUs);
router.delete('/:id?', authenticateAndAuthorize(['admin']), deleteContactUs);

module.exports = router;