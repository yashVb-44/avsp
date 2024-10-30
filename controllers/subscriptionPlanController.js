const asyncHandler = require('express-async-handler');
const SubscriptionPlan = require('../models/subscriptionPlan');

// Add a new Subscription Plan
const addSubscriptionPlan = asyncHandler(async (req, res) => {
    try {
        const subscriptionPlan = new SubscriptionPlan({
            ...req.body
        });

        await subscriptionPlan.save();

        return res.status(201).json({
            message: 'Subscription plan created successfully',
            type: 'success',
            subscriptionPlan,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to create subscription plan',
            error: error.message,
            type: 'error',
        });
    }
});

// Get Subscription Plan by ID or all Subscription Plans
const getSubscriptionPlan = asyncHandler(async (req, res) => {
    try {
        const { role } = req.user
        const { id } = req.params;
        let subscriptionPlan;

        if (id) {
            // Get specific subscription plan by ID
            subscriptionPlan = await SubscriptionPlan.findById(id);
            if (!subscriptionPlan) {
                return res.status(404).json({
                    message: 'Subscription plan not found',
                    type: 'error',
                });
            }
        } else {
            // Get all subscription plans
            role === "admin" ? subscriptionPlan = await SubscriptionPlan.find().sort({ createdAt: -1 }) : subscriptionPlan = await SubscriptionPlan.find({ isActive: true }).sort({ createdAt: -1 })
        }

        return res.status(200).json({
            message: 'Subscription plans retrieved successfully',
            type: 'success',
            subscriptionPlan,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to retrieve subscription plans',
            error: error.message,
            type: 'error',
        });
    }
});

// Update Subscription Plan
const updateSubscriptionPlan = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const subscriptionPlan = await SubscriptionPlan.findById(id);

        if (!subscriptionPlan) {
            return res.status(404).json({
                message: 'Subscription plan not found',
                type: 'error',
            });
        }

        // Update only the provided fields
        Object.assign(subscriptionPlan, req.body);

        await subscriptionPlan.save();

        return res.status(200).json({
            message: 'Subscription plan updated successfully',
            type: 'success',
            subscriptionPlan,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to update subscription plan',
            error: error.message,
            type: 'error',
        });
    }
});

// Delete Subscription Plan by ID or all Subscription Plans
const deleteSubscriptionPlan = asyncHandler(async (req, res) => {

    try {
        const { id } = req.params;

        if (id) {
            // Delete a specific subscription plan by ID
            const subscriptionPlan = await SubscriptionPlan.findById(id);

            if (!subscriptionPlan) {
                return res.status(404).json({
                    message: 'Subscription plan not found',
                    type: 'error',
                });
            }

            await SubscriptionPlan.deleteOne({ _id: id });

            return res.status(200).json({
                message: 'Subscription plan deleted successfully',
                type: 'success',
            });
        } else {
            // Delete all subscription plans
            await SubscriptionPlan.deleteMany();

            return res.status(200).json({
                message: 'All subscription plans deleted successfully',
                type: 'success',
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to delete subscription plans',
            error: error.message,
            type: 'error',
        });
    }
});

module.exports = {
    addSubscriptionPlan,
    getSubscriptionPlan,
    updateSubscriptionPlan,
    deleteSubscriptionPlan
};
