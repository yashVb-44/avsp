const asyncHandler = require('express-async-handler');
const ServiceWithPrice = require('../models/serviceWithPrice');

// Add ServiceWithPrice
const addServiceWithPrice = asyncHandler(async (req, res) => {
    try {
        const user = req.user;
        const serviceData = { ...req.body, vendor: user.id };

        const existingService = await ServiceWithPrice.findOne({
            shopService: req.body.shopService,
            vendor: user.id
        });

        if (existingService) {
            return res.status(400).json({
                message: 'Service with this price already exists',
                type: 'error'
            });
        }

        const newService = new ServiceWithPrice(serviceData);
        await newService.save();

        return res.status(201).json({
            message: 'Service added successfully',
            type: 'success',
            service: newService,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to add service',
            error: error.message,
            type: 'error',
        });
    }
});

// Get ServiceWithPrice by ID or all services
const getServiceWithPrice = asyncHandler(async (req, res) => {
    try {
        const vendor = req.user;
        const { id } = req.params;
        let service;

        if (id) {
            // Get a specific service by ID
            service = await ServiceWithPrice.findById(id).populate('shopService');

            if (!service) {
                return res.status(404).json({
                    message: 'Service not found',
                    type: 'error',
                });
            }
        } else {
            // Get all services
            service = await ServiceWithPrice.find({ vendor: vendor.id }).populate('shopService');
        }

        return res.status(200).json({
            service,
            type: 'success',
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to retrieve services',
            error: error.message,
            type: 'error',
        });
    }
});

// Update ServiceWithPrice
const updateServiceWithPrice = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const service = await ServiceWithPrice.findById(id);

        if (!service) {
            return res.status(404).json({
                message: 'Service not found',
                type: 'error',
            });
        }

        // Update only the provided fields
        Object.assign(service, req.body);
        await service.save();

        return res.status(200).json({
            message: 'Service updated successfully',
            type: 'success',
            service,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to update service',
            error: error.message,
            type: 'error',
        });
    }
});

// Delete ServiceWithPrice (by ID or all)
const deleteServiceWithPrice = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        if (id) {
            // Delete a specific service by ID
            const service = await ServiceWithPrice.findById(id);

            if (!service) {
                return res.status(404).json({
                    message: 'Service not found',
                    type: 'error',
                });
            }

            await ServiceWithPrice.deleteOne({ _id: id });

            return res.status(200).json({
                message: 'Service deleted successfully',
                type: 'success',
            });
        } else {
            // Delete all services
            await ServiceWithPrice.deleteMany();

            return res.status(200).json({
                message: 'All services deleted successfully',
                type: 'success',
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to delete services',
            error: error.message,
            type: 'error',
        });
    }
});

module.exports = {
    addServiceWithPrice,
    getServiceWithPrice,
    updateServiceWithPrice,
    deleteServiceWithPrice
};
