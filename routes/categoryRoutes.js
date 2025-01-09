
const express = require('express');
const router = express.Router();
const { authenticateAndAuthorize } = require('../middleware/authMiddleware');
const { addCategory, getCategory, updateCategory, deleteCategory, getCategorysForAdmin } = require('../controllers/categoryController');

router.post('/add', authenticateAndAuthorize(['admin', 'vendor']), addCategory);
router.get('/list/forAdmin', authenticateAndAuthorize(['admin']), getCategorysForAdmin);
router.get('/:id?', authenticateAndAuthorize(['admin', 'vendor']), getCategory);
router.put('/update/:id', authenticateAndAuthorize(['admin', 'vendor']), updateCategory);
router.delete('/:id?', authenticateAndAuthorize(['admin', 'vendor']), deleteCategory);

module.exports = router;