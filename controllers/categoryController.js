const asyncHandler = require('express-async-handler');
const Category = require('../models/category');

// Add Category
const addCategory = asyncHandler(async (req, res) => {
    try {
        const { id, role } = req.user;
        const { name } = req.body;
        const categoryData = {
            ...req.body,
            vendor: role === 'admin' ? null : id,
            createdBy: role, // 'admin' or 'vendor'
        };

        const existingCategory = await Category.findOne({ name, vendor: role === 'admin' ? null : id, isDeleted: false });

        if (existingCategory) {
            return res.status(400).json({
                message: 'Category already exists',
                type: 'error',
            });
        }

        const category = new Category(categoryData);
        await category.save();

        return res.status(201).json({
            message: 'Category added successfully',
            type: 'success',
            category,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to add category',
            error: error.message,
            type: 'error',
        });
    }
});

// Get Category by ID or all Categories for the vendor
const getCategory = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { id: userId, role } = req.user;
        let category;

        if (id) {
            // Get a specific category by ID
            category = await Category.findOne({ _id: id, $or: [{ vendor: userId }, { createdBy: 'admin' }] });

            if (!category) {
                return res.status(404).json({
                    message: 'Category not found',
                    type: 'error',
                });
            }
        } else {
            // Get all categories for the vendor, including those created by admin
            category = role === 'admin'
                ? await Category.find()
                : await Category.find({
                    $or: [
                        { isActive: true, vendor: userId },
                        { isActive: true, createdBy: 'admin' },
                    ],
                });
        }

        return res.status(200).json({
            category,
            type: 'success',
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to retrieve category',
            error: error.message,
            type: 'error',
        });
    }
});

// Update Category
const updateCategory = asyncHandler(async (req, res) => {
    try {
        const { id: userId, role } = req.user;
        const { id } = req.params;
        const category = await Category.findOne({ _id: id, vendor: userId });

        if (!category && role !== 'admin') {
            return res.status(404).json({
                message: 'Category not found',
                type: 'error',
            });
        }

        // Update only the provided fields
        Object.assign(category, req.body);

        await category.save();

        return res.status(200).json({
            message: 'Category updated successfully',
            type: 'success',
            category,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to update category',
            error: error.message,
            type: 'error',
        });
    }
});

// Delete Category (by ID or all)
const deleteCategory = asyncHandler(async (req, res) => {
    try {
        const { id: userId, role } = req.user;
        const { id } = req.params;

        if (id) {
            // Delete a specific category by ID
            const category = role === 'admin'
                ? await Category.findById(id)
                : await Category.findOne({ _id: id, vendor: userId });

            if (!category) {
                return res.status(404).json({
                    message: 'Category not found',
                    type: 'error',
                });
            }

            category.isDeleted = true;
            category.isActive = false
            await category.save();

            return res.status(200).json({
                message: 'Category deleted successfully',
                type: 'success',
            });
        } else {
            // Delete all categories
            // Category.deleteMany()

            return res.status(200).json({
                message: 'All categories deleted successfully',
                type: 'success',
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to delete category',
            error: error.message,
            type: 'error',
        });
    }
});

module.exports = {
    addCategory,
    updateCategory,
    getCategory,
    deleteCategory,
};
