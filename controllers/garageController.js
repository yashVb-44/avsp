const asyncHandler = require('express-async-handler');
const Garage = require('../models/garage');

// Add a new Garage 
const addGarage = asyncHandler(async (req, res) => {
    try {
        const vendorId = req.user.id;

        const existingGarage = await Garage.findOne({ vendor: vendorId });

        if (existingGarage) {
            return res.status(400).json({
                message: 'Garage already exists',
                type: 'error',
            });
        }

        // Find the garage with the highest registerId
        const lastGarage = await Garage.findOne().sort({ number: -1 });

        // Determine the new registerId and number
        const newNumber = lastGarage ? lastGarage.number + 1 : 1;
        const newRegisterId = lastGarage ? (parseInt(lastGarage.registerId) + 1).toString() : "1000";

        const garageData = {
            ...req.body,
            vendor: vendorId,
            registerId: newRegisterId,
            number: newNumber,
        };

        const garage = new Garage(garageData);
        await garage.save();

        return res.status(201).json({
            message: 'Garage added successfully',
            type: 'success',
            garage,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to add garage',
            error: error.message,
            type: 'error',
        });
    }
});

// Get all Garages or a specific Garage by ID
const getGarage = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        let garages;

        if (id) {
            // Get a specific garage by ID
            const garage = await Garage.findById(id)
                .populate('shopService')
                .populate('vendor')
                .populate('company');

            if (!garage) {
                return res.status(404).json({
                    message: 'Garage not found',
                    type: 'error'
                });
            }

            if (user.role === 'admin' || (user.role === 'vendor' && garage.vendor.equals(user.id))) {
                return res.status(200).json({
                    garage,
                    type: 'success'
                });
            } else {
                return res.status(403).json({
                    message: 'Forbidden',
                    type: 'error'
                });
            }
        } else {
            // Get all garages
            if (user.role === 'admin') {
                garages = await Garage.find().populate('shopService').populate('company');

            } else if (user.role === 'vendor') {
                garages = await Garage.find({ vendor: user.id }).populate('shopService').populate('company');
            } else {
                return res.status(403).json({
                    message: 'Forbidden',
                    type: 'error'
                });
            }

            return res.status(200).json({
                garages,
                type: 'success'
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to retrieve garage',
            error: error.message,
            type: 'error'
        });
    }
});

// Update Garage details
const updateGarage = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;
        const user = req.user;

        // Find the garage to update
        const garage = await Garage.findById(id).populate('vendor');

        if (!garage) {
            return res.status(404).json({
                message: 'Garage not found',
                type: 'error'
            });
        }

        // Check if the user is an admin or the vendor who created the garage
        if (user.role === 'admin' || (user.role === 'vendor' && garage.vendor.equals(user.id))) {
            // Update only the provided fields
            Object.assign(garage, updatedData);
            await garage.save();

            return res.status(200).json({
                message: 'Garage updated successfully',
                garage,
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
            message: 'Failed to update garage',
            error: error.message,
            type: 'error'
        });
    }
});

module.exports = { addGarage, getGarage, updateGarage };