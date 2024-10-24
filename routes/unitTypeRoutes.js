
const express = require('express');
const router = express.Router();
const { authenticateAndAuthorize } = require('../middleware/authMiddleware');
const { addUnitType, getUnitType, updateUnitType, deleteUnitType } = require('../controllers/unitTypeController');

router.post('/add', authenticateAndAuthorize(['admin']), addUnitType);
router.get('/:id?', authenticateAndAuthorize(['admin', 'vendor']), getUnitType);
router.put('/update/:id', authenticateAndAuthorize(['admin']), updateUnitType);
router.delete('/:id?', authenticateAndAuthorize(['admin']), deleteUnitType);

module.exports = router;