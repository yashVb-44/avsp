// models/ShopService.js
const mongoose = require('mongoose');

const shopServiceSchema = mongoose.Schema({
    shopService: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ShopService',
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
    },
    price: {
        type: Number,
        default: 0
    },
    priceType: {
        type: String,
        default: "0"
    },
    taxIncluded: {
        type: Boolean,
        default: false
    },
    sac: {
        type: String,
    },
    gst: {
        type: Number,
        default: 0
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('ServiceWithPrice', shopServiceSchema);
