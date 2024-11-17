
const express = require('express');
const router = express.Router();
const { authenticateAndAuthorize } = require('../middleware/authMiddleware');
const { addAddress, getAddress, updateAddress, deleteAddress } = require('../controllers/addressController');

router.post('/add', authenticateAndAuthorize(['admin', 'user']), addAddress);
router.get('/:id?', authenticateAndAuthorize(['admin', 'user']), getAddress);
router.put('/update/:id', authenticateAndAuthorize(['admin', 'user']), updateAddress);
router.delete('/delete/:id', authenticateAndAuthorize(['admin', 'user']), deleteAddress);

module.exports = router;