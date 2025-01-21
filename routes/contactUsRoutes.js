
const express = require('express');
const router = express.Router();
const { authenticateAndAuthorize } = require('../middleware/authMiddleware');
const { addContactUs, getContactUs, updateContactUs, deleteContactUs, getContactUsForAdmin } = require('../controllers/contactUsController');

router.post('/add', authenticateAndAuthorize(['user', 'vendor']), addContactUs);
router.get('/:id?', authenticateAndAuthorize(['admin', 'user', 'vendor']), getContactUs);
router.get('/list/forAdmin', authenticateAndAuthorize(['admin']), getContactUsForAdmin);
router.put('/update/:id', authenticateAndAuthorize(['admin']), updateContactUs);
router.delete('/:id?', authenticateAndAuthorize(['admin']), deleteContactUs);

module.exports = router;