
const express = require('express');
const router = express.Router();
const { authenticateAndAuthorize } = require('../middleware/authMiddleware');
const { addExpenseCategory, getExpenseCategory, updateExpenseCategory, deleteExpenseCategory, getExpenseCategorysForAdmin } = require('../controllers/expenseCategoryController');

router.post('/add', authenticateAndAuthorize(['admin', 'vendor']), addExpenseCategory);
router.get('/list/forAdmin', authenticateAndAuthorize(['admin']), getExpenseCategorysForAdmin);
router.get('/:id?', authenticateAndAuthorize(['admin', 'vendor']), getExpenseCategory);
router.put('/update/:id', authenticateAndAuthorize(['admin', 'vendor']), updateExpenseCategory);
router.delete('/:id?', authenticateAndAuthorize(['admin', 'vendor']), deleteExpenseCategory);

module.exports = router;    