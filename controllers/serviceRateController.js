const asyncHandler = require('express-async-handler');
const ServiceRate = require('../models/serviceRate');

// Add a new ServiceRate
const addServiceRate = asyncHandler(async (req, res) => {
    try {
        const vendorId = req.user.id;

        // Check if user is a vendor
        if (req.user.role !== 'vendor') {
            return res.status(403).json({
                message: 'Forbidden',
                type: 'error'
            });
        }

        const serviceRateData = {
            ...req.body,
            vendor: vendorId,
        };

        const existingServiceRate = await ServiceRate.findOne({ vendor: vendorId })

        if (existingServiceRate) {
            return res.status(400).json({
                message: 'Service rate already exist',
                type: 'error'
            });
        }

        const serviceRate = new ServiceRate(serviceRateData);
        await serviceRate.save();

        return res.status(201).json({
            message: 'Service rate added successfully',
            type: 'success',
            serviceRate,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to add service rate',
            error: error.message,
            type: 'error'
        });
    }
});

// Get all ServiceRates or a specific ServiceRate by ID
const getServiceRate = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        let serviceRates;

        if (id) {
            // Get a specific service rate by ID
            const serviceRate = await ServiceRate.findById(id)
                .populate('emeregencyService')
                .populate('vendor')

            if (!serviceRate) {
                return res.status(404).json({
                    message: 'Service rate not found',
                    type: 'error'
                });
            }

            if (user.role === 'admin' || (user.role === 'vendor' && serviceRate.vendor.equals(user.id))) {
                return res.status(200).json({
                    serviceRate,
                    type: 'success'
                });
            } else {
                return res.status(403).json({
                    message: 'Forbidden',
                    type: 'error'
                });
            }
        } else {
            // Get all service rates
            if (user.role === 'admin') {
                serviceRates = await ServiceRate.find().populate('vendor').populate('emeregencyService');
            } else if (user.role === 'vendor') {
                serviceRates = await ServiceRate.find({ vendor: user.id }).populate('vendor').populate('emeregencyService');
            } else {
                return res.status(403).json({
                    message: 'Forbidden',
                    type: 'error'
                });
            }

            return res.status(200).json({
                serviceRates,
                type: 'success'
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to retrieve service rate',
            error: error.message,
            type: 'error'
        });
    }
});

// Update ServiceRate details
const updateServiceRate = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;
        const user = req.user;

        // Find the service rate to update
        const serviceRate = await ServiceRate.findById(id).populate('vendor');

        if (!serviceRate) {
            return res.status(404).json({
                message: 'Service rate not found',
                type: 'error'
            });
        }

        // Check if the user is an admin or the vendor who created the service rate
        if (user.role === 'admin' || (user.role === 'vendor' && serviceRate.vendor.equals(user.id))) {
            // Update only the provided fields
            Object.assign(serviceRate, updatedData);
            await serviceRate.save();

            return res.status(200).json({
                message: 'Service rate updated successfully',
                serviceRate,
                type: 'success'
            });
        } else {
            return res.status(403).json({
                message: 'Forbidden',
                type: 'error'
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to update service rate',
            error: error.message,
            type: 'error'
        });
    }
});

module.exports = {
    addServiceRate,
    getServiceRate,
    updateServiceRate
};

