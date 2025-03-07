const mongoose = require("mongoose");

const subscriptionHistorySchema = new mongoose.Schema(
    {
        vendorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vendor",
            required: true,
        }, // Reference to the Vendor
        subscriptionPlanId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubscriptionPlan",
            required: true,
        }, // Reference to the Subscription Plan
        planDetails: {
            type: Object
        },
        purchaseDate: { type: String }, // Date when the subscription was purchased
        startDate: { type: String, required: true }, // Subscription start date
        endDate: { type: String, required: true }, // Subscription end date
        isActive: { type: Boolean, default: true }, // Whether the subscription is currently active
        autoRenew: { type: Boolean, default: false }, // Auto-renewal option
        renewalCount: { type: Number, default: 0 }, // Tracks the number of renewals
        totalPaidAmount: { type: Number, required: true }, // Amount paid for the subscription
        gst: { type: Number, default: 0 },
        amount: { type: Number, default: 0 },
        additional: {
            type: Number,
            default: 0
        },
        paymentMethod: {
            type: String,
            enum: ["Credit Card", "PayPal", "Bank Transfer"],
            required: true,
        }, // Payment method
        status: {
            type: String,
            enum: ["Active", "Expired", "Cancelled"],
            default: "Active",
        }, // Status of the subscription
    },
    { timestamps: true }
); // Adds createdAt and updatedAt fields automatically

module.exports = mongoose.model(
    "SubscriptionHistory",
    subscriptionHistorySchema
);
