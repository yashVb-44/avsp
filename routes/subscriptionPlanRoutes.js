
const express = require('express');
const router = express.Router();
const { authenticateAndAuthorize } = require('../middleware/authMiddleware');
const { addSubscriptionPlan, getSubscriptionPlan, updateSubscriptionPlan, deleteSubscriptionPlan } = require('../controllers/subscriptionPlanController');

router.post('/add', authenticateAndAuthorize(['admin']), addSubscriptionPlan);
router.get('/:id?', authenticateAndAuthorize(['admin', 'vendor']), getSubscriptionPlan);
router.put('/update/:id', authenticateAndAuthorize(['admin']), updateSubscriptionPlan);
router.delete('/:id?', authenticateAndAuthorize(['admin']), deleteSubscriptionPlan);

module.exports = router;