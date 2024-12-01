
const express = require('express');
const router = express.Router();
const { authenticateAndAuthorize } = require('../middleware/authMiddleware');
const { addProduct, getProduct, updateProduct, deleteProduct } = require('../controllers/productController');

router.post('/add', authenticateAndAuthorize(['vendor']), addProduct);
router.post('/:id?', authenticateAndAuthorize(['vendor']), getProduct);
router.put('/update/:id', authenticateAndAuthorize(['vendor']), updateProduct);
router.delete('/:id?', authenticateAndAuthorize(['vendor']), deleteProduct);

module.exports = router;