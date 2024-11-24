const asyncHandler = require('express-async-handler');
const Gst = require('../models/gst');

// Add Gst
const addGst = asyncHandler(async (req, res) => {
    try {
        const gstData = {
            ...req.body,
        };

        const existingGst = await Gst.findOne(req.body)

        // if (existingGst) {
        //     return res.status(400).json({
        //         message: 'Gst already exist',
        //         type: 'error'
        //     });
        // }

        const gst = new Gst(gstData);
        await gst.save();

        return res.status(201).json({
            message: 'Gst added successfully',
            type: 'success',
            gst,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to add gst',
            error: error.message,
            type: 'error',
        });
    }
});

// Get Gst by ID or all Gstes for the vendor
const getGst = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { id: userId, role } = req.user;
        let gst;

        if (id) {
            // Get a specific gst by ID
            gst = await Gst.findOne({ _id: id });

            if (!gst) {
                return res.status(404).json({
                    message: 'Gst not found',
                    type: 'error',
                });
            }
        } else {
            // Get all gstes for the user
            role === "admin" ? gst = await Gst.find() : gst = await Gst.find({ isActive: true });
        }

        return res.status(200).json({
            gst,
            type: 'success',
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to retrieve gst',
            error: error.message,
            type: 'error',
        });
    }
});

// Update Gst
const updateGst = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const gst = await Gst.findOne({ _id: id });

        if (!gst) {
            return res.status(404).json({
                message: 'Gst not found',
                type: 'error',
            });
        }

        // Update only the provided fields
        Object.assign(gst, req.body);

        await gst.save();

        return res.status(200).json({
            message: 'Gst updated successfully',
            type: 'success',
            gst,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to update gst',
            error: error.message,
            type: 'error',
        });
    }
});

// Delete Gst (by ID or all)
const deleteGst = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        if (id) {
            // Delete a specific gst by ID
            const gst = await Gst.findById(id);

            if (!gst) {
                return res.status(404).json({
                    message: 'Gst not found',
                    type: 'error',
                });
            }

            await Gst.deleteOne({ _id: id });

            return res.status(200).json({
                message: 'Gst deleted successfully',
                type: 'success',
            });
        } else {
            // Delete all gst
            await Gst.deleteMany();

            return res.status(200).json({
                message: 'All gst deleted successfully',
                type: 'success',
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to delete gst',
            error: error.message,
            type: 'error',
        });
    }
});

module.exports = {
    addGst,
    updateGst,
    getGst,
    deleteGst
};
