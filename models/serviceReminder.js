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
}, {
    timestamps: true,
});

module.exports = mongoose.model('ServiceReminder', serviceReminderSchema);
