
const express = require('express');
const router = express.Router();
const { authenticateAndAuthorize } = require('../middleware/authMiddleware');
const { addCategory, getCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');

router.post('/add', authenticateAndAuthorize(['admin']), addCategory);
router.get('/:id?', authenticateAndAuthorize(['admin', 'vendor']), getCategory);
router.put('/update/:id', authenticateAndAuthorize(['admin']), updateCategory);
router.delete('/:id?', authenticateAndAuthorize(['admin']), deleteCategory);

module.exports = router;