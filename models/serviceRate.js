const mongoose = require('mongoose');

const rateSchema = mongoose.Schema({
    day: {
        type: String,
        enum: ['0-5', '0-10', '0-15', '0-20'],
    },
    dayCharge: {
        type: Number,
    },
    nightCharge: {
        type: Number,
    },
    isAvailable: {
        type: Boolean,
        default: false,
    },
});

const serviceRateSchema = mongoose.Schema({
    isEmergencyVisit: {
        type: Boolean,
        default: false,
    },
    emergencyTiming: {
        type: String, // "0" or "1"
        enum: ['0', '1'],
    },
    emeregencyService: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EmergencyService',
    }],
    kilometerRates: [rateSchema],
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('ServiceRate', serviceRateSchema);
