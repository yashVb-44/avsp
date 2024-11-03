// models/ShopService.js
const mongoose = require('mongoose');

const serviceReminderSchema = mongoose.Schema({
    days: {
        type: String
    },
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
    },
    date: {
        type: String,
    },
    kilometer: {
        type: Number,
        default: 0
    },
    isNotificationSend: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('ServiceReminder', serviceReminderSchema);
