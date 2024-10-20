const asyncHandler = require('express-async-handler');
const Expense = require('../models/expense');
const { SaleAndPurchaseTransaction } = require('../utils/transaction');
const { generateInvoiceCode } = require('../utils/invoice');
const { addRemoveAmountFromWallet, getCustmoreWalletBalance, processWalletAndTransaction } = require('../utils/wallet');

// Add Expense
const addExpense = asyncHandler(async (req, res) => {
    try {
        const vendor = req.user;
        const { amount, paymentType } = req.body
        let newExpense = new Expense({
            ...req.body,
            from: vendor.id,
        });

        await SaleAndPurchaseTransaction({ owner: vendor.id, transactionType: "2", subType: "0", amountType: "0", paymentType: "2", amount: amount, totalAmount: amount, ownerModel: "Vendor", paymentType })

        await newExpense.save();
        return res.status(201).json({
            message: 'Expense added successfully',
            type: 'success',
            expense: newExpense,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to add expense',
            error: error.message,
            type: 'error',
        });
    }
});

module.exports = {
    addExpense
}