
const express = require('express');
const router = express.Router();
const { authenticateAndAuthorize } = require('../middleware/authMiddleware');
const { addRating, getRatingsForVendor, getVendorRatings, addRatingByVendor } = require('../controllers/ratingController');

router.post('/add', authenticateAndAuthorize(['user']), addRating);
router.post('/add/byVendor', authenticateAndAuthorize(['vendor']), addRatingByVendor);
router.get('/forVendor', authenticateAndAuthorize(['vendor']), getRatingsForVendor);
router.get('/ofVendor/:vendorId', authenticateAndAuthorize(['user']), getVendorRatings);
// router.post('/return', authenticateAndAuthorize(['vendor']), returnSaleInvoice);
// router.post('/counter', authenticateAndAuthorize(['vendor']), counterSaleInvoice);
// router.get('/list/:id?', authenticateAndAuthorize(['admin', 'vendor']), getSaleInvoice);
// router.get('/user/list/:userId', authenticateAndAuthorize(['admin', 'vendor']), getSaleInvoicePartyWise);


module.exports = router;