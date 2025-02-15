const asyncHandler = require('express-async-handler');
const SubscriptionHistory = require('../models/subscriptionHistory');



// Get Subscription History by ID or all Subscription Histories
const getSubscriptionHistory = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        let subscriptionHistory;

        if (id) {
            subscriptionHistory = await SubscriptionHistory.findById(id)
                .populate('vendorId')
                .populate('subscriptionPlanId');
            if (!subscriptionHistory) {
                return res.status(404).json({
                    message: 'Subscription history not found',
                    type: 'error',
                });
            }
        } else {
            subscriptionHistory = await SubscriptionHistory.find()
                .populate('vendorId')
                .populate('subscriptionPlanId')
                .sort({ createdAt: -1 });
        }

        return res.status(200).json({
            message: 'Subscription history retrieved successfully',
            type: 'success',
            subscriptionHistory,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to retrieve subscription history',
            error: error.message,
            type: 'error',
        });
    }
});

// Update Subscription History
const updateSubscriptionHistory = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const subscriptionHistory = await SubscriptionHistory.findById(id);

        if (!subscriptionHistory) {
            return res.status(404).json({
                message: 'Subscription history not found',
                type: 'error',
            });
        }

        Object.assign(subscriptionHistory, req.body);
        await subscriptionHistory.save();

        return res.status(200).json({
            message: 'Subscription history updated successfully',
            type: 'success',
            subscriptionHistory,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to update subscription history',
            error: error.message,
            type: 'error',
        });
    }
});

// Delete Subscription History by ID
const deleteSubscriptionHistory = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        if (id) {
            const subscriptionHistory = await SubscriptionHistory.findById(id);
            if (!subscriptionHistory) {
                return res.status(404).json({
                    message: 'Subscription history not found',
                    type: 'error',
                });
            }
            await SubscriptionHistory.deleteOne({ _id: id });
            return res.status(200).json({
                message: 'Subscription history deleted successfully',
                type: 'success',
            });
        }

        return res.status(400).json({
            message: 'Subscription history ID is required',
            type: 'error',
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to delete subscription history',
            error: error.message,
            type: 'error',
        });
    }
});

module.exports = {
    getSubscriptionHistory,
    updateSubscriptionHistory,
    deleteSubscriptionHistory
};
