const express = require('express');
const router = express.Router();
const { authenticateAndAuthorize } = require('../middleware/authMiddleware');
const { addVehicle, getVehicles, updateVehicle, deleteVehicle, addVehicleByVendor } = require('../controllers/myVehicleController');

router.post('/add', authenticateAndAuthorize(['user']), addVehicle);
router.post('/add/byVendor', authenticateAndAuthorize(['vendor']), addVehicleByVendor);
router.get('/:id?', authenticateAndAuthorize(['admin', 'user']), getVehicles);
router.put('/update/:id', authenticateAndAuthorize(['user']), updateVehicle);
router.delete('/delete/:id?', authenticateAndAuthorize(['admin', 'user']), deleteVehicle);

module.exports = router;