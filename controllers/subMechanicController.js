const asyncHandler = require('express-async-handler');
const SubMechanic = require('../models/subMechanic');

// Add SubMechanic
const addSubMechanic = asyncHandler(async (req, res) => {
    try {

        const { mobileNo } = req.body
        const { id: vendorId } = req.user;
        const subMechanicData = {
            ...req.body,
            vendor: vendorId
        };

        const existingSubMechanic = await SubMechanic.findOne({ mobileNo, vendor: vendorId })

        if (existingSubMechanic) {
            return res.status(400).json({
                message: 'SubMechanic already exist',
                type: 'error'
            });
        }

        const subMechanic = new SubMechanic(subMechanicData);
        await subMechanic.save();

        return res.status(201).json({
            message: 'SubMechanic added successfully',
            type: 'success',
            subMechanic,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to add subMechanic',
            error: error.message,
            type: 'error',
        });
    }
});

// Get SubMechanic by ID or all SubMechanices for the vendor
const getSubMechanic = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { id: vendorId } = req.user;

        let subMechanic;

        if (id === "active") {
            subMechanic = await SubMechanic.find({ vendor: vendorId, status: true }).sort({ createdAt: -1 })
        }
        else if (id && id !== "active") {
            // Get a specific SubMechanic by ID
            subMechanic = await SubMechanic.findOne({ _id: id })

            if (!subMechanic) {
                return res.status(404).json({
                    message: 'SubMechanic not found',
                    type: 'error',
                });
            }

            // Check if the logged-in vendor is the one who created this SubMechanic
            if (subMechanic.vendor.toString() !== vendorId.toString()) {
                return res.status(403).json({
                    message: 'Unauthorized to view this SubMechanic',
                    type: 'error',
                });
            }
        } else {
            // Get all SubMechanics for the logged-in vendor
            subMechanic = await SubMechanic.find({ vendor: vendorId }).sort({ createdAt: -1 })
        }

        return res.status(200).json({
            subMechanic,
            type: 'success',
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to retrieve SubMechanic',
            error: error.message,
            type: 'error',
        });
    }
});

const getActiveSubMechanic = asyncHandler(async (req, res) => {
    try {
        const { id: vendorId } = req.user;

        // Get all active SubMechanics for the logged-in vendor
        let subMechanic = await SubMechanic.find({ vendor: vendorId, status: true, isDeactive: true }).sort({ createdAt: -1 })

        return res.status(200).json({
            subMechanic,
            type: 'success',
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: 'Failed to retrieve SubMechanic',
            error: error.message,
            type: 'error',
        });
    }
});

const getDeActiveSubMechanic = asyncHandler(async (req, res) => {
    try {
        const { id: vendorId } = req.user;

        // Get all active SubMechanics for the logged-in vendor
        let subMechanic = await SubMechanic.find({ vendor: vendorId, status: true, isDeactive: false }).sort({ createdAt: -1 })

        return res.status(200).json({
            subMechanic,
            type: 'success',
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: 'Failed to retrieve SubMechanic',
            error: error.message,
            type: 'error',
        });
    }
});

// Update SubMechanic
const updateSubMechanic = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { id: vendorId } = req.user;

        const subMechanic = await SubMechanic.findOne({ _id: id });

        if (!subMechanic) {
            return res.status(404).json({
                message: 'SubMechanic not found',
                type: 'error',
            });
        }

        // Check if the logged-in vendor is the one who created this SubMechanic
        if (subMechanic.vendor.toString() !== vendorId.toString()) {
            return res.status(403).json({
                message: 'Unauthorized to update this SubMechanic',
                type: 'error',
            });
        }

        // Update only the provided fields
        Object.assign(subMechanic, req.body);

        await subMechanic.save();

        return res.status(200).json({
            message: 'SubMechanic updated successfully',
            type: 'success',
            subMechanic,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to update SubMechanic',
            error: error.message,
            type: 'error',
        });
    }
});

// Delete SubMechanic (by ID or all)
const deleteSubMechanic = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { id: vendorId } = req.user;

        if (id) {
            // Delete a specific SubMechanic by ID
            const subMechanic = await SubMechanic.findById(id);

            if (!subMechanic) {
                return res.status(404).json({
                    message: 'SubMechanic not found',
                    type: 'error',
                });
            }

            // Check if the logged-in vendor is the one who created this SubMechanic
            if (subMechanic.vendor.toString() !== vendorId.toString()) {
                return res.status(403).json({
                    message: 'Unauthorized to delete this SubMechanic',
                    type: 'error',
                });
            }

            await SubMechanic.deleteOne({ _id: id });

            return res.status(200).json({
                message: 'SubMechanic deleted successfully',
                type: 'success',
            });
        } else {
            // Delete all SubMechanics for the logged-in vendor
            await SubMechanic.deleteMany({ vendor: vendorId });

            return res.status(200).json({
                message: 'All SubMechanics deleted successfully for this vendor',
                type: 'success',
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to delete SubMechanic',
            error: error.message,
            type: 'error',
        });
    }
});


module.exports = {
    addSubMechanic,
    updateSubMechanic,
    getSubMechanic,
    getActiveSubMechanic,
    deleteSubMechanic,
    getDeActiveSubMechanic
};
