const asyncHandler = require('express-async-handler');
const ExpenseCategory = require('../models/expenseCategory');

// Add ExpenseCategory
const addExpenseCategory = asyncHandler(async (req, res) => {
    try {
        const { id } = req.user
        const { name } = req.body

        const expenseExpenseCategoryData = {
            ...req.body,
            vendor: id
        };

        const existingExpenseCategory = await ExpenseCategory.findOne({ name, vendor: id })

        if (existingExpenseCategory) {
            return res.status(400).json({
                message: 'ExpenseCategory already exist',
                type: 'error'
            });
        }

        const expenseExpenseCategory = new ExpenseCategory(expenseExpenseCategoryData);
        await expenseExpenseCategory.save();

        return res.status(201).json({
            message: 'ExpenseCategory added successfully',
            type: 'success',
            expenseExpenseCategory,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to add expenseExpenseCategory',
            error: error.message,
            type: 'error',
        });
    }
});

// Get ExpenseCategory by ID or all ExpenseCategoryes for the vendor
const getExpenseCategory = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { id: userId, role } = req.user;
        let expenseExpenseCategory;

        if (id) {
            // Get a specific expenseExpenseCategory by ID
            expenseExpenseCategory = await ExpenseCategory.findOne({ _id: id, vendor: userId });

            if (!expenseExpenseCategory) {
                return res.status(404).json({
                    message: 'ExpenseCategory not found',
                    type: 'error',
                });
            }
        } else {
            // Get all expenseExpenseCategoryes for the user
            role === "admin" ? expenseExpenseCategory = await ExpenseCategory.find() : expenseExpenseCategory = await ExpenseCategory.find({ isActive: true, vendor: userId });
        }

        return res.status(200).json({
            expenseExpenseCategory,
            type: 'success',
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to retrieve expenseExpenseCategory',
            error: error.message,
            type: 'error',
        });
    }
});

// Update ExpenseCategory
const updateExpenseCategory = asyncHandler(async (req, res) => {
    try {
        const { id: userId } = req.user
        const { id } = req.params;
        const expenseExpenseCategory = await ExpenseCategory.findOne({ _id: id, vendor: userId });

        if (!expenseExpenseCategory) {
            return res.status(404).json({
                message: 'ExpenseCategory not found',
                type: 'error',
            });
        }

        // Update only the provided fields
        Object.assign(expenseExpenseCategory, req.body);

        await expenseExpenseCategory.save();

        return res.status(200).json({
            message: 'ExpenseCategory updated successfully',
            type: 'success',
            expenseExpenseCategory,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to update expenseExpenseCategory',
            error: error.message,
            type: 'error',
        });
    }
});

// Delete ExpenseCategory (by ID or all)
const deleteExpenseCategory = asyncHandler(async (req, res) => {
    try {
        const { id: userId, role } = req.user
        const { id } = req.params;

        if (id) {
            // Delete a specific expenseExpenseCategory by ID
            const expenseExpenseCategory = role === 'admin' ? await ExpenseCategory.findById(id) : await ExpenseCategory.findOne({ _id: id, vendor: userId })

            if (!expenseExpenseCategory) {
                return res.status(404).json({
                    message: 'ExpenseCategory not found',
                    type: 'error',
                });
            }

            expenseExpenseCategory.isActive = false

            await expenseExpenseCategory.save()

            return res.status(200).json({
                message: 'ExpenseCategory deleted successfully',
                type: 'success',
            });
        } else {
            // Delete all categories
            // await ExpenseCategory.deleteMany();

            return res.status(200).json({
                message: 'All categories deleted successfully',
                type: 'success',
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to delete expenseExpenseCategory',
            error: error.message,
            type: 'error',
        });
    }
});

module.exports = {
    addExpenseCategory,
    updateExpenseCategory,
    getExpenseCategory,
    deleteExpenseCategory
};
