// models/ShopService.js
const mongoose = require('mongoose');

const shopServiceSchema = mongoose.Schema({
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
        enum: ['admin', 'vendor', 'user']
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
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'Booking',
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('ShopService', shopServiceSchema);
