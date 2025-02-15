const asyncHandler = require('express-async-handler');
const SubscriptionPlan = require('../models/subscriptionPlan');
const SubscriptionHistory = require("../models/subscriptionHistory")

// Purchase a Subscription
const purchaseSubscription = asyncHandler(async (req, res) => {
    try {
        const { id } = req.user;
        const { subscriptionPlanId, paymentMethod, totalPaidAmount, gst, amount, additional, autoRenew } = req.body;

        // Validate subscription plan
        const subscriptionPlan = await SubscriptionPlan.findById(subscriptionPlanId);
        if (!subscriptionPlan) {
            return res.status(404).json({
                message: 'Subscription plan not found',
                type: 'error'
            });
        }

        // Get current date in IST (Indian Standard Time)
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Remove time part

        // Calculate end date based on additional field (0 = 12 months, 1 = 24 months, 2 = 36 months)
        const durationInMonths = additional === 1 ? 24 : additional === 2 ? 36 : 12;
        const endDate = new Date(now);
        endDate.setMonth(endDate.getMonth() + durationInMonths);

        // Format dates as DD-MM-YYYY
        const formatDate = (date) => {
            return date.toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata' }); // Converts to DD-MM-YYYY
        };

        const newSubscription = new SubscriptionHistory({
            ...req.body,
            vendorId: id,
            planDetails: subscriptionPlan,
            purchaseDate: formatDate(now),
            startDate: formatDate(now),
            endDate: formatDate(endDate),
            isActive: true,
            autoRenew: autoRenew || false,
            renewalCount: 0,
            additional: additional || 0,
            paymentMethod,
            status: 'Active'
        });

        await newSubscription.save();

        return res.status(201).json({
            message: 'Subscription purchased successfully',
            type: 'success',
            subscription: newSubscription
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to purchase subscription',
            error: error.message,
            type: 'error'
        });
    }
});

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
    deleteSubscriptionPlan,
    purchaseSubscription
};
