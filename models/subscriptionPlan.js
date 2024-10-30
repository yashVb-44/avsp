const mongoose = require("mongoose");

const subscriptionPlanSchema = new mongoose.Schema(
    {
        type: { type: String },
        name: { type: String }, // Name of the subscription plan
        description: { type: String }, // Description of the plan (optional)
        monthlyPrice: { type: Number, default: 0 },    // Monthly price of the plan
        yearlyPrice: { type: Number, default: 0 },
        validityPeriod: {
            monthly: { type: Number, default: 1 },           // Validity of monthly subscription in months
            yearly: { type: Number, default: 12 }            // Validity of yearly subscription in months
        },
        features: [{ type: String }], // List of features included in the plan
        isActive: { type: Boolean, default: true }, // To deactivate the plan if needed
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("SubscriptionPlan", subscriptionPlanSchema);
