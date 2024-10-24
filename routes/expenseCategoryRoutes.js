
const express = require('express');
const router = express.Router();
const { authenticateAndAuthorize } = require('../middleware/authMiddleware');
const { addExpenseCategory, getExpenseCategory, updateExpenseCategory, deleteExpenseCategory } = require('../controllers/expenseCategoryController');

router.post('/add', authenticateAndAuthorize(['admin']), addExpenseCategory);
router.get('/:id?', authenticateAndAuthorize(['admin', 'vendor']), getExpenseCategory);
router.put('/update/:id', authenticateAndAuthorize(['admin']), updateExpenseCategory);
router.delete('/:id?', authenticateAndAuthorize(['admin']), deleteExpenseCategory);

module.exports = router;