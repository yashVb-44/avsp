
const express = require('express');
const router = express.Router();
const { authenticateAndAuthorize } = require('../middleware/authMiddleware');
const { addExpense, getExpense } = require('../controllers/expenseController');

router.post('/add', authenticateAndAuthorize(['vendor']), addExpense);
router.post('/', authenticateAndAuthorize(['vendor']), getExpense);

module.exports = router;