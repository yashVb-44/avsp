// models/Transaction.js
const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
    },
    ownerVendor: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'Vendor',
    },
    ownerUser: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'User',
    },
    booking: [{
        bookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking',
        },
        amount: {
            type: Number,
        }
    }],
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
    },
    invocieID: {
        type: String
    },
    totalAmount: {
        type: Number,
    },
    amountType: {
        type: String,
        default: "0" // 0 = invoice(booking) , 1= recived, 2= debited
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
        // enum: [
        //     'user_booking_online' = "0",
        //     'sale_invoice',
        //     'sale_counter',
        //     'sale_return',
        //     'sale_payment_in',
        //     'purchase_invoice',
        //     'purchase_return',
        //     'purchase_out',
        //     'other'
        // ],
        default: "0" // 0 = booking confirm by vendor , 1 = vendor manually add user wallet without booking , 2 = vendor manually add user wallet with booking
    },
    isWithAddOnAmount: {
        type: String,
        default: "0" // 0 = no , 1 = yes
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Transaction', transactionSchema);
