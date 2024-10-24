const mongoose = require('mongoose');

// Schema for FAQ items
const FAQSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
    },
    answer: {
        type: String,
        required: true,
    }
});

// Main settings schema
const SettingSchema = new mongoose.Schema({
    isAppActive: {
        type: Boolean,
        default: true, // Default isAppActive to true (app is live)
    },
    faqs: [FAQSchema], // Array of FAQs
    terms: {
        type: String,
        default: '', // Terms and Conditions
    },
    privacy: {
        type: String,
        default: '', // Privacy Policy
    },
    about: {
        type: String,
        default: '', // About Us content
    },
    support: {
        type: String,
        default: ''
    },
    contact: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Setting', SettingSchema);
