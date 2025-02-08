const asyncHandler = require('express-async-handler');
const ShopService = require('../models/shopService');
const Vendor = require('../models/vendor');
const Admin = require('../models/admin');

// Create a new service
const createService = asyncHandler(async (req, res) => {
    try {
        const { name, serviceType } = req.body;
        const { id: createdBy, role: createdByModel } = req.user;
        // Validate role to ensure it’s either Admin or Vendor
        if (!['admin', 'vendor', 'user'].includes(createdByModel)) {
            return res.status(403).json({
                message: 'Unauthorized action',
                type: 'error'
            });
        }

        // Set visibility based on the creator type
        const visibility = createdByModel === 'admin' ? 'all_vendors' : 'creator_only';

        const existingService = await ShopService.findOne({ name, serviceType })

        if (existingService) {
            return res.status(403).json({
                message: 'Service already exist',
                type: 'error'
            });
        }
        // Create the service
        let newServiceData = {
            name,
            serviceType,
            createdBy,
            createdByModel,
            visibility
        };
        const newService = await ShopService.create(newServiceData);

        return res.status(201).json({
            message: 'Service created successfully',
            type: 'success',
            service: newService
        });
    } catch (error) {
        console.log(error)
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
            services = await ShopService.find();
        } else if (role === 'vendor') {
            // Vendor can see services created by admin and themselves
            const vendor = await Vendor.findById(userId);
            services = await ShopService.find({
                serviceType: vendor.serviceType,
                isShow: true,
                $or: [
                    { visibility: 'all_vendors' },
                    { createdBy: userId, visibility: 'creator_only' }
                ]
            });
        } else if (role === 'user') {
            services = await ShopService.find(
                { createdBy: userId, visibility: 'creator_only', isShow: true }
            );
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
        const services = await ShopService.find({
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

// Get Services for Admin
const getServicesForAdmin = async (req, res) => {
    try {
        const { search, page = 1, limit = 10 } = req.query; // Get search term, page, and limit from query parameters

        // Ensure page and limit are valid integers
        const pageNumber = parseInt(page) || 1;
        const limitNumber = parseInt(limit) || 10;

        // Build search query based on name, email, or mobile number
        let searchQuery = {};
        if (search && search.trim() !== '') {
            const regex = new RegExp(search.trim(), 'i'); // Case-insensitive partial match
            searchQuery = {
                $or: [
                    { name: regex },
                ]
            };
        }

        // Calculate total services matching the query
        const totalServices = await ShopService.countDocuments(searchQuery);


        let services = await ShopService.find(searchQuery)
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)
            .sort({ createdAt: -1 }); // Sort by creation date, newest first

        services = services.map((service) => {
            let serviceTypeName = "";
            if (service.serviceType === "1") {
                serviceTypeName = "2 wheeler";
            } else if (service.serviceType === "2") {
                serviceTypeName = "3 wheeler";
            } else if (service.serviceType === "3") {
                serviceTypeName = "4 wheeler";
            } else if (service.serviceType === "4") {
                serviceTypeName = "Heavy Vehicle"; // Fixed spelling
            }
            return {
                ...service.toObject(), // Ensure we return a plain object
                serviceTypeName
            };
        });

        // Send response
        res.status(200).json({
            type: 'success',
            message: 'Services list retrieved successfully',
            totalServices,
            totalPages: Math.ceil(totalServices / limitNumber),
            currentPage: pageNumber,
            services,
        });
    } catch (error) {
        res.status(500).json({
            type: 'error',
            message: 'Error fetching services list',
            error: error.message
        });
    }
};

const updateService = asyncHandler(async (req, res) => {
    try {
        const { shopServiceId } = req.params
        const { id, role } = req.user;
        const existingService = role === "admin" ? await ShopService.findById(shopServiceId) : await ShopService.findOne({ _id: shopServiceId, createdBy: id })

        if (!existingService) {
            return res.status(403).json({
                message: 'Service not exist',
                type: 'error'
            });
        }

        Object.assign(existingService, req.body);
        await existingService.save()
        return res.status(201).json({
            message: 'Service update successfully',
            type: 'success',
            service: existingService
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: 'Server error',
            type: 'error',
            error: error.message
        });
    }
});


module.exports = {
    createService,
    getServices,
    getServicesForUser,
    getServicesForAdmin,
    updateService
};
