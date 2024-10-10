// models/ShopService.js
const mongoose = require('mongoose');

const emergencyServiceSchema = mongoose.Schema({
    name: {
        type: String,
    },
    serviceType: {
        type: String,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'createdByModel',
    },
    createdByModel: {
        type: String,
        enum: ['admin', 'vendor']
    },
    visibility: {
        type: String,
        enum: ['all_vendors', 'creator_only'],
        default: 'creator_only'
    },
    isShow: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('EmergencyService', emergencyServiceSchema);
