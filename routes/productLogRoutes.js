
const express = require('express');
const router = express.Router();
const { authenticateAndAuthorize } = require('../middleware/authMiddleware');
const { InOutProduct, getProductHistory } = require('../controllers/productLogController');

router.post('/add', authenticateAndAuthorize(['vendor']), InOutProduct);
router.get('/:id?', authenticateAndAuthorize(['vendor']), getProductHistory);
// router.put('/update/:id', authenticateAndAuthorize(['vendor']), updateProduct);
// router.delete('/:id?', authenticateAndAuthorize(['vendor']), deleteProduct);

module.exports = router;