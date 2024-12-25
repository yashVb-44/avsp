const asyncHandler = require('express-async-handler');
const Expense = require('../models/expense');
const { SaleAndPurchaseTransaction } = require('../utils/transaction');
const { generateInvoiceCode } = require('../utils/invoice');
const { addRemoveAmountFromWallet, getCustmoreWalletBalance, processWalletAndTransaction } = require('../utils/wallet');

// Add Expense
const addExpense = asyncHandler(async (req, res) => {
    try {
        const vendor = req.user;
        const { amount, paymentType, category } = req.body
        let newExpense = new Expense({
            ...req.body,
            from: vendor.id,
        });

        await SaleAndPurchaseTransaction({ owner: vendor.id, transactionType: "2", subType: "0", amountType: "0", paymentType: "2", amount: amount, totalAmount: amount, ownerModel: "Vendor", paymentType, expenseId: newExpense._id, expenseCategory: category })

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

const getExpense = asyncHandler(async (req, res) => {
    try {
        const vendor = req.user;
        const { id } = req.params;
        const { categories } = req.body;

        let filter = {};
        let sortOption = { createdAt: -1 }; // Default sorting: newest first

        if (categories && categories.length > 0) {
            filter.category = { $in: categories }; // Filter by multiple categories
        }

        let expense;

        if (id) {
            // Get a specific expense by ID
            expense = await Expense.findById(id).populate("category");

            if (!expense) {
                return res.status(404).json({
                    message: "Expense not found",
                    type: "error",
                });
            }
        } else {
            // Get all expenses with filtering and sorting
            expense = await Expense.find(filter).populate("category").sort(sortOption);

        }

        return res.status(200).json({
            expense,
            type: "success",
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to retrieve expenses",
            error: error.message,
            type: "error",
        });
    }
});

module.exports = {
    addExpense,
    getExpense
}