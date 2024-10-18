const mongoose = require('mongoose');

const saleInvoiceSchema = new mongoose.Schema({
    invoice: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Invoice',
    },
    type: {
        type: String,
        default: "0"
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'toModel',
    },
    toModel: {
        type: String,
        required: true,
        enum: ['User', 'Vendor'],
    },
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
    },
    productWithPrice: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
        },
        productName: String,
        quantity: {
            type: Number,
            default: 1
        },
        // labourCharges: {
        //     type: Number,
        //     default: 0
        // },
        price: {
            type: Number,
            default: 0
        }
    }],
    subTotal: {
        type: Number,
        default: 0
    },
    remainingAmount: {
        type: Number,
        default: 0
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    date: String
}, {
    timestamps: true,
});

module.exports = mongoose.model('SaleInvoice', saleInvoiceSchema);
