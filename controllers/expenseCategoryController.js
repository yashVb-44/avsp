const asyncHandler = require('express-async-handler');
const ExpenseCategory = require('../models/expenseCategory');

// Add ExpenseCategory
const addExpenseCategory = asyncHandler(async (req, res) => {
    try {
        const { id, role } = req.user;
        const { name } = req.body;

        const expenseCategoryData = {
            ...req.body,
            vendor: role === 'admin' ? null : id,
            createdBy: role, // 'admin' or 'vendor'
        };

        const existingExpenseCategory = await ExpenseCategory.findOne({ name, vendor: role === 'admin' ? null : id, isDeleted: false });

        if (existingExpenseCategory) {
            return res.status(400).json({
                message: 'ExpenseCategory already exists',
                type: 'error'
            });
        }

        const expenseCategory = new ExpenseCategory(expenseCategoryData);
        await expenseCategory.save();

        return res.status(201).json({
            message: 'ExpenseCategory added successfully',
            type: 'success',
            expenseCategory,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to add expense category',
            error: error.message,
            type: 'error',
        });
    }
});

// Get ExpenseCategory by ID or all ExpenseCategories for the vendor
const getExpenseCategory = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { id: userId, role } = req.user;
        let expenseCategories;

        if (id) {
            // Get a specific expense category by ID
            expenseCategories = await ExpenseCategory.findOne({ _id: id, $or: [{ vendor: userId }, { createdBy: 'admin' }] });

            if (!expenseCategories) {
                return res.status(404).json({
                    message: 'ExpenseCategory not found',
                    type: 'error',
                });
            }
        } else {
            // Get all expense categories for the user, including admin categories
            // if (role === "admin") {
            //     expenseCategories = await ExpenseCategory.find();
            // } else {
            //     expenseCategories = await ExpenseCategory.find({
            //         isActive: true,
            //         $or: [
            //             { vendor: userId },    // Vendor's own categories
            //             { vendor: null }       // Admin categories (vendor field is null)
            //         ]
            //     });
            // }
            expenseCategories = role === 'admin'
                ? await ExpenseCategory.find()
                : await ExpenseCategory.find({
                    $or: [
                        { isActive: true, vendor: userId },
                        { isActive: true, createdBy: 'admin' },
                    ],
                });
        }

        return res.status(200).json({
            expenseCategories,
            type: 'success',
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to retrieve expense categories',
            error: error.message,
            type: 'error',
        });
    }
});

// Update ExpenseCategory
const updateExpenseCategory = asyncHandler(async (req, res) => {
    try {
        const { id: userId, role } = req.user;
        const { id } = req.params;
        const expenseCategory = await ExpenseCategory.findOne({ _id: id, vendor: userId });

        if (!expenseCategory && role !== 'admin') {
            return res.status(404).json({
                message: 'ExpenseCategory not found',
                type: 'error',
            });
        }

        // Update only the provided fields
        Object.assign(expenseCategory, req.body);

        await expenseCategory.save();

        return res.status(200).json({
            message: 'ExpenseCategory updated successfully',
            type: 'success',
            expenseCategory,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to update expense category',
            error: error.message,
            type: 'error',
        });
    }
});

// Delete ExpenseCategory (by ID or all)
const deleteExpenseCategory = asyncHandler(async (req, res) => {
    try {
        const { id: userId, role } = req.user;
        const { id } = req.params;

        if (id) {
            // Delete a specific expense category by ID
            const expenseCategory = role === 'admin' ? await ExpenseCategory.findById(id) : await ExpenseCategory.findOne({ _id: id, vendor: userId });

            if (!expenseCategory) {
                return res.status(404).json({
                    message: 'ExpenseCategory not found',
                    type: 'error',
                });
            }

            expenseCategory.isActive = false;
            expenseCategory.isDeleted = true

            await expenseCategory.save();

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
            message: 'Failed to delete expense category',
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
