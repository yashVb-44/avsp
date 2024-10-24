const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ExpenseCategory',
    },
    name: {
        type: String,
    },
    type: {
        type: String,
        default: "0"
    },
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
    },
    amount: {
        type: Number,
        default: 0
    },
    paymentType: {
        type: String,
        default: "0"
    },
    remainingAmount: {
        type: Number,
        default: 0
    },
    note: {
        type: String
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    date: String
}, {
    timestamps: true,
});

module.exports = mongoose.model('Expense', expenseSchema);
