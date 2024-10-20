const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    number: {
        type: Number,
    },
    invoiceCode: {
        type: String
    },
    type: {
        type: String,
        default: "0"
    },
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'toModel',
    },
    toModel: {
        type: String,
        required: true,
        enum: ['User', 'Vendor', 'TempVendor'],
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Invoice', invoiceSchema);
