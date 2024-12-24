// models/Product.js
const mongoose = require('mongoose');

const productLogSchema = mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
    },
    type: {
        type: String,
        default: "0"
    },
    salePrice: {
        type: Number,
        default: 0
    },
    purchasePrice: {
        type: Number,
        default: 0
    },
    stock: {
        type: Number,
        default: 0
    },
    unitType: {
        type: String,
        default: "0"
    },
    unit: {
        type: Number,
    },
    date: {
        type: String
    },
    invoiceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Invoice',
    },
    notes: String
}, {
    timestamps: true,
});

module.exports = mongoose.model('ProductLog', productLogSchema);
