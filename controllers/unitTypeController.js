const asyncHandler = require('express-async-handler');
const UnitType = require('../models/unitType');

// Add UnitType
const addUnitType = asyncHandler(async (req, res) => {
    try {
        const unitTypeData = {
            ...req.body,
        };

        const existingUnitType = await UnitType.findOne(req.body)

        if (existingUnitType) {
            return res.status(400).json({
                message: 'UnitType already exist',
                type: 'error'
            });
        }

        const unitType = new UnitType(unitTypeData);
        await unitType.save();

        return res.status(201).json({
            message: 'UnitType added successfully',
            type: 'success',
            unitType,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to add unitType',
            error: error.message,
            type: 'error',
        });
    }
});

// Get UnitType by ID or all UnitTypees for the vendor
const getUnitType = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { id: userId, role } = req.user;
        let unitType;

        if (id) {
            // Get a specific unitType by ID
            unitType = await UnitType.findOne({ _id: id });

            if (!unitType) {
                return res.status(404).json({
                    message: 'UnitType not found',
                    type: 'error',
                });
            }
        } else {
            // Get all unitTypees for the user
            role === "admin" ? unitType = await UnitType.find() : unitType = await UnitType.find({ isActive: true });
        }

        return res.status(200).json({
            unitType,
            type: 'success',
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to retrieve unitType',
            error: error.message,
            type: 'error',
        });
    }
});

// Update UnitType
const updateUnitType = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const unitType = await UnitType.findOne({ _id: id });

        if (!unitType) {
            return res.status(404).json({
                message: 'UnitType not found',
                type: 'error',
            });
        }

        // Update only the provided fields
        Object.assign(unitType, req.body);

        await unitType.save();

        return res.status(200).json({
            message: 'UnitType updated successfully',
            type: 'success',
            unitType,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to update unitType',
            error: error.message,
            type: 'error',
        });
    }
});

// Delete UnitType (by ID or all)
const deleteUnitType = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        if (id) {
            // Delete a specific unitType by ID
            const unitType = await UnitType.findById(id);

            if (!unitType) {
                return res.status(404).json({
                    message: 'UnitType not found',
                    type: 'error',
                });
            }

            await UnitType.deleteOne({ _id: id });

            return res.status(200).json({
                message: 'UnitType deleted successfully',
                type: 'success',
            });
        } else {
            // Delete all unit types
            await UnitType.deleteMany();

            return res.status(200).json({
                message: 'All unit types deleted successfully',
                type: 'success',
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to delete unitType',
            error: error.message,
            type: 'error',
        });
    }
});

module.exports = {
    addUnitType,
    updateUnitType,
    getUnitType,
    deleteUnitType
};
