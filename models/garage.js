const mongoose = require('mongoose');

const timingSchema = mongoose.Schema({
    day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
    startTime: {
        type: String, // Format as "HH:mm"
    },
    endTime: {
        type: String, // Format as "HH:mm"
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
});

const garageSchema = mongoose.Schema({
    name: {
        type: String,
    },
    address: {
        type: String,
    },
    registerId: {
        type: String,
        default: "1000"
    },
    number: {
        type: Number,
        default: 1
    },
    garageAddress: {
        type: String
    },
    lat: {
        type: Number,
    },
    lng: {
        type: Number,
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
    yearsOfGarage: {
        type: Number
    },
    taluka: {
        type: String,
    },
    village: {
        type: String,
    },
    isGst: {
        type: Boolean,
        default: false,
    },
    gstNo: {
        type: String,
    },
    shopService: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ShopService',
    }],
    company: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
    }],
    vehicalTypeHandle: [{
        type: String,
    }],
    isSensorService: {
        type: Boolean,
        default: false,
    },
    privacyPolicy: {
        type: String,
    },
    weeklyTimings: [timingSchema],
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Garage', garageSchema);
