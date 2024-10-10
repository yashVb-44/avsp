// models/ShopService.js
const mongoose = require('mongoose');

const extraServiceSchema = mongoose.Schema({
    name: {
        type: String,
    },
    vendor: {
        type: Schema.Types.ObjectId,
        ref: 'Vendor',
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    booking: {
        type: Schema.Types.ObjectId,
        ref: 'Booking',
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('ExtraService', extraServiceSchema);
