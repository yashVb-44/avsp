const express = require('express');
const router = express.Router();
const { authenticateAndAuthorize } = require('../middleware/authMiddleware');
const { addGarage, getGarage, updateGarage } = require('../controllers/garageController');

router.post('/add', authenticateAndAuthorize(['admin', 'vendor']), addGarage);
router.get('/:id?', authenticateAndAuthorize(['admin', 'vendor']), getGarage);
router.put('/update/:id', authenticateAndAuthorize(['admin', 'vendor']), updateGarage);

module.exports = router;