// models/Vendor.js
const mongoose = require('mongoose');

const vendorSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    profileImage: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
        sparse: true,
    },
    mobileNo: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: false,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    isApproved: {
        type: Boolean,
        default: false,
    },
    country: {
        type: String,
    },
    state: {
        type: String,
    },
    city: {
        type: String,
    },
    language: {
        type: String,
    },
    gender: {
        type: String,
    },
    otp: {
        type: String, // Store the OTP for authentication
    },
    otpExpiresAt: {
        type: Date, // Store the expiration time of the OTP
    },
    serviceType: {
        type: String, // Additional field for vendor service type
    },
    role: {
        type: String,
        default: "vendor" // Changed role field to default to "vendor"
    },
    dateOfBirth: {
        type: String
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Vendor', vendorSchema);
