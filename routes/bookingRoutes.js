
const express = require('express');
const router = express.Router();
const { authenticateAndAuthorize } = require('../middleware/authMiddleware');
const { addBooking, getBookingList, getBookingDetails, cancelBooking, getBookingListOfVendor, declineBooking, uploadImage, updateBooking, removeServiceFromBooking, addBookingByVendor, getJobcardList } = require('../controllers/bookingController');


router.post('/add', authenticateAndAuthorize(['user']), addBooking);
router.post('/add/byVendor', authenticateAndAuthorize(['vendor']), addBookingByVendor);
router.get('/', authenticateAndAuthorize(['admin', 'user', 'vendor']), getBookingList);
router.get('/jobcard/list', authenticateAndAuthorize(['vendor']), getJobcardList);
router.get('/details/:bookingId', authenticateAndAuthorize(['admin', 'user', 'vendor']), getBookingDetails);
router.post('/ofVendor', authenticateAndAuthorize(['vendor']), getBookingListOfVendor);
router.put('/cancel/:bookingId', authenticateAndAuthorize(['user']), cancelBooking);
router.put('/decline/:bookingId', authenticateAndAuthorize(['vendor']), declineBooking);
router.put('/image/upload/:id', authenticateAndAuthorize(['vendor']), uploadImage);
router.put('/update/:id', authenticateAndAuthorize(['vendor']), updateBooking);
router.delete('/remove/service/:id', authenticateAndAuthorize(['vendor']), removeServiceFromBooking);

module.exports = router;