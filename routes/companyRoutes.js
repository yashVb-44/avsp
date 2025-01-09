
const express = require('express');
const router = express.Router();
const { authenticateAndAuthorize } = require('../middleware/authMiddleware');
const { addCompany, getCompany, updateCompany, deleteCompany, getCompanyForAdmin } = require('../controllers/companyController');

router.post('/add', authenticateAndAuthorize(['admin']), addCompany);
router.get('/list/forAdmin', authenticateAndAuthorize(['admin']), getCompanyForAdmin);
router.get('/:id?', authenticateAndAuthorize(['admin', 'user', 'vendor']), getCompany);
router.put('/update/:id', authenticateAndAuthorize(['admin']), updateCompany);
router.delete('/:id?', authenticateAndAuthorize(['admin']), deleteCompany);

module.exports = router;