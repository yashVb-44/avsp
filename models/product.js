// models/Product.js
const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
    },
    name: {
        type: String,
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
    },
    salePrice: {
        type: Number,
        default: 0
    },
    purchasePrice: {
        type: Number,
        default: 0
    },
    openStock: {
        type: Number,
        default: 0
    },
    stock: {
        type: Number,
        default: 0
    },
    lowStock: {
        type: Number,
        default: 0
    },
    unitType: {
        type: String,
    },
    taxIncluded: {
        type: Boolean,
        default: false
    },
    hsn: {
        type: String,
    },
    gst: {
        type: Number,
    },
    date: {
        type: String
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Product', productSchema);
