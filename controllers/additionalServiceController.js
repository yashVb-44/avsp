const asyncHandler = require('express-async-handler');
const AdditionalService = require('../models/additionalService');

// Add a new Additional Service
const addAdditionalService = asyncHandler(async (req, res) => {
    try {
        const vendorId = req.user.id;

        // Check if user is a vendor
        if (req.user.role !== 'vendor') {
            return res.status(403).json({
                message: 'Forbidden',
                type: 'error'
            });
        }

        const additionalServiceData = {
            ...req.body,
            vendor: vendorId,
        };

        const existingService = await AdditionalService.findOne({ vendor: vendorId })

        if (existingService) {
            return res.status(400).json({
                message: 'Additional service already exist',
                type: 'error'
            });
        }

        const additionalService = new AdditionalService(additionalServiceData);
        await additionalService.save();

        return res.status(201).json({
            message: 'Additional service added successfully',
            additionalService,
            type: 'success',
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to add additional service',
            error: error.message,
            type: 'error',
        });
    }
});

// Get all Additional Services or a specific Additional Service by ID
const getAdditionalService = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        let additionalServices;

        if (id) {
            // Get a specific additional service by ID
            const additionalService = await AdditionalService.findById(id);

            if (!additionalService) {
                return res.status(404).json({
                    message: 'Additional service not found',
                    type: 'error',
                });
            }

            // Check if the user is the vendor who created the service or an admin
            if (user.role === 'admin' || (user.role === 'vendor' && additionalService.vendor.equals(user.id))) {
                return res.status(200).json({
                    additionalService,
                    type: 'success',
                });
            } else {
                return res.status(403).json({
                    message: 'Forbidden',
                    type: 'error',
                });
            }
        } else {
            // Get all additional services for the vendor or all if admin
            if (user.role === 'admin') {
                additionalServices = await AdditionalService.find();
            } else if (user.role === 'vendor') {
                additionalServices = await AdditionalService.find({ vendor: user.id });
            } else {
                return res.status(403).json({
                    message: 'Forbidden',
                    type: 'error',
                });
            }

            return res.status(200).json({
                additionalServices,
                type: 'success',
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to retrieve additional services',
            error: error.message,
            type: 'error',
        });
    }
});

// Update Additional Service details
const updateAdditionalService = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;
        const user = req.user;

        // Find the additional service to update
        const additionalService = await AdditionalService.findById(id);

        if (!additionalService) {
            return res.status(404).json({
                message: 'Additional service not found',
                type: 'error',
            });
        }

        // Check if the user is an admin or the vendor who created the additional service
        if (user.role === 'admin' || (user.role === 'vendor' && additionalService.vendor.equals(user.id))) {
            // Update only the provided fields
            Object.assign(additionalService, updatedData);
            await additionalService.save();

            return res.status(200).json({
                message: 'Additional service updated successfully',
                additionalService,
                type: 'success',
            });
        } else {
            return res.status(403).json({
                message: 'Forbidden',
                type: 'error',
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to update additional service',
            error: error.message,
            type: 'error',
        });
    }
});

module.exports = {
    addAdditionalService,
    getAdditionalService,
    updateAdditionalService
};
