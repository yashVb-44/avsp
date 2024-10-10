const express = require('express');
const router = express.Router();
const { addSubMechanic, updateSubMechanic, getSubMechanic, deleteSubMechanic } = require('../controllers/subMechanicController');
const { authenticateAndAuthorize } = require('../middleware/authMiddleware');


router.post('/add', authenticateAndAuthorize(['vendor']), addSubMechanic);
router.get('/:id?', authenticateAndAuthorize(['vendor']), getSubMechanic);
router.put('/update/:id', authenticateAndAuthorize(['vendor']), updateSubMechanic);
router.delete('/:id?', authenticateAndAuthorize(['vendor']), deleteSubMechanic);

module.exports = router;
