const express = require('express');
const router = express.Router();
const { authenticateAndAuthorize } = require('../middleware/authMiddleware');
const { addVehicle, getVehicles, updateVehicle, deleteVehicle, addVehicleByVendor, getUserVehiclesByVendor, searchVehicleByNumber } = require('../controllers/myVehicleController');

router.post('/add', authenticateAndAuthorize(['user']), addVehicle);
router.post('/add/byVendor', authenticateAndAuthorize(['vendor']), addVehicleByVendor);
router.get('/search', authenticateAndAuthorize(['vendor']), searchVehicleByNumber);
router.get('/:id?', authenticateAndAuthorize(['admin', 'user']), getVehicles);
router.post('/byVendor', authenticateAndAuthorize(['vendor']), getUserVehiclesByVendor);
router.put('/update/:id', authenticateAndAuthorize(['user']), updateVehicle);
router.delete('/delete/:id?', authenticateAndAuthorize(['admin', 'user']), deleteVehicle);

module.exports = router;