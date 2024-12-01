const mongoose = require('mongoose');

const saleInvoiceSchema = new mongoose.Schema({
    invoice: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Invoice',
    },
    type: {
        type: String,
        default: "0" // 0 = add, 1 = return , 2 = counter, 3 = counter return
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
    saleLinkId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SaleInvoice',
    },
    paymentType: {
        type: String,
        default: "0" // 0 = cash , 1 = online
    },
    date: String
}, {
    timestamps: true,
});

module.exports = mongoose.model('SaleInvoice', saleInvoiceSchema);
