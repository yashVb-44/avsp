
const express = require('express');
const router = express.Router();
const { authenticateAndAuthorize } = require('../middleware/authMiddleware');
const { addReport, getReport, updateReport, deleteReport } = require('../controllers/reportController');

router.post('/add', authenticateAndAuthorize(['vendor']), addReport);
router.get('/:id?', authenticateAndAuthorize(['admin', 'vendor']), getReport);
router.put('/update/:id', authenticateAndAuthorize(['admin', 'vendor']), updateReport);
router.delete('/:id?', authenticateAndAuthorize(['admin', 'vendor']), deleteReport);


module.exports = router;