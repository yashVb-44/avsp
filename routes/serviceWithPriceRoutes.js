
const express = require('express');
const router = express.Router();
const { authenticateAndAuthorize } = require('../middleware/authMiddleware');
const { addServiceWithPrice, getServiceWithPrice, updateServiceWithPrice, deleteServiceWithPrice } = require('../controllers/serviceWithPriceController');

router.post('/add', authenticateAndAuthorize(['vendor']), addServiceWithPrice);
router.get('/:id?', authenticateAndAuthorize(['vendor']), getServiceWithPrice);
router.put('/update/:id', authenticateAndAuthorize(['vendor']), updateServiceWithPrice);
router.delete('/:id?', authenticateAndAuthorize(['vendor']), deleteServiceWithPrice);

module.exports = router;