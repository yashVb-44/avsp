// models/Transaction.js
const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'customerModel',
    },
    customerModel: {
        type: String,
        enum: ['User', 'Vendor', 'TempVendor'],
    },
    ownerModel: {
        type: String,
        enum: ['User', 'Vendor'],
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'ownerModel',
    },
    inovice: [{
        id: {
            type: mongoose.Schema.Types.ObjectId,
        },
        amount: Number,
        remainingAmount: Number,
        transactionType: {
            type: String,
            enum: ["Booking", "SaleInvoice"]
        } // for booking = booking
    }],
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
    },
    invoiceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Invoice',
    },
    totalAmount: {
        type: Number,
    },
    addOnAmount: {
        type: Number
    },
    amountType: {
        type: String,
        default: "0" // 0 = invoice(booking) , 1= recived, 2= debited,3= nothing, 4 = booking
    },
    paymentType: {
        type: String,
        default: "0" // 0 = cash , 1 = online, 2 = wallet
    },
    amount: {
        type: Number
    },
    remainingAmount: {
        type: Number
    },
    billingType: {
        type: String,
        default: "0" // 0 = unpaid , 1= paid, 2= nothing
    },
    transactionType: {
        type: String,
        default: "0" // 0 = sales, 1 = purchase, 3 = others
    },
    subType: {
        type: String,
        default: "0"
    },
    isWithAddOnAmount: {
        type: String, // 0 = no, 1= yes
    },
    isDebitFromWallet: {
        type: String // 0 = no, 1 = yes
    },
    note: String
}, {
    timestamps: true,
});

module.exports = mongoose.model('Transaction', transactionSchema);
