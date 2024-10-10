const asyncHandler = require('express-async-handler');
const EmergencyService = require('../models/emeregencyService');
const Vendor = require('../models/vendor');
const Admin = require('../models/admin');

// Create a new service
const createService = asyncHandler(async (req, res) => {
    try {
        const { name, serviceType } = req.body;
        const { id: createdBy, role: createdByModel } = req.user;
        // Validate role to ensure it’s either Admin or Vendor
        if (!['admin', 'vendor'].includes(createdByModel)) {
            return res.status(403).json({
                message: 'Unauthorized aciton',
                type: 'error'
            });
        }

        // Set visibility based on the creator type
        const visibility = createdByModel === 'admin' ? 'all_vendors' : 'creator_only';

        const existingService = await EmergencyService.findOne({ name, serviceType })

        if (existingService) {
            return res.status(403).json({
                message: 'Service already exist',
                type: 'error'
            });
        }
        // Create the service
        const newService = await EmergencyService.create({
            name,
            serviceType,
            createdBy,
            createdByModel,
            visibility
        });

        return res.status(201).json({
            message: 'Service created successfully',
            type: 'success',
            service: newService
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Server error',
            type: 'error',
            error: error.message
        });
    }
});

// Get services for a vendor or admin
const getServices = asyncHandler(async (req, res) => {
    try {
        const { id: userId, role } = req.user;

        let services;

        if (role === 'admin') {
            // Admin can see all services
            services = await EmergencyService.find();
        } else if (role === 'vendor') {
            // Vendor can see services created by admin and themselves
            services = await EmergencyService.find({
                $or: [
                    { visibility: 'all_vendors' },
                    { createdBy: userId, visibility: 'creator_only' }
                ]
            });
        } else {
            return res.status(403).json({
                message: 'Unauthorized action',
                type: 'error'
            });
        }

        return res.status(200).json({
            message: 'Services retrieved successfully',
            type: 'success',
            services
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Server error',
            type: 'error',
            error: error.message
        });
    }
});

// Get Services for User
const getServicesForUser = asyncHandler(async (req, res) => {
    try {
        const { mechType } = req.query;

        // Find services where isShow is true and serviceType matches the provided mechType
        const services = await EmergencyService.find({
            isShow: true,
            serviceType: mechType,
        });

        if (services.length === 0) {
            return res.status(404).json({
                message: 'No services found',
                type: 'error',
            });
        }

        return res.status(200).json({
            services,
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



module.exports = {
    createService,
    getServices,
    getServicesForUser,
};
