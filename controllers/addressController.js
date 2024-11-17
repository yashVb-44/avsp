const asyncHandler = require('express-async-handler');
const Address = require('../models/address');

// Add Address
const addAddress = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id;

        const addressData = {
            ...req.body,
            user: userId,
        };

        const address = new Address(addressData);
        await address.save();

        return res.status(201).json({
            message: 'Address added successfully',
            type: 'success',
            address,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to add address',
            error: error.message,
            type: 'error',
        });
    }
});

// Get Address by ID or all Addresses for the user
const getAddress = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        let address;

        if (id) {
            // Get a specific address by ID
            address = await Address.findOne({ _id: id, user: userId, isDeleted: false });

            if (!address) {
                return res.status(404).json({
                    message: 'Address not found',
                    type: 'error',
                });
            }
        } else {
            // Get all addresses for the user
            address = await Address.find({ user: userId, isDeleted: false });
        }

        return res.status(200).json({
            address,
            type: 'success',
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to retrieve address',
            error: error.message,
            type: 'error',
        });
    }
});

// Update Address
const updateAddress = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Find the address by ID and ensure it belongs to the user
        const address = await Address.findOne({ _id: id, user: userId });

        if (!address) {
            return res.status(404).json({
                message: 'Address not found',
                type: 'error',
            });
        }

        // Update only the provided fields
        Object.assign(address, req.body);

        await address.save();

        return res.status(200).json({
            message: 'Address updated successfully',
            type: 'success',
            address,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to update address',
            error: error.message,
            type: 'error',
        });
    }
});

const deleteAddress = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Find the address by ID and ensure it belongs to the user
        const address = await Address.findOne({ _id: id, user: userId });

        if (!address) {
            return res.status(404).json({
                message: 'Address not found',
                type: 'error',
            });
        }

        // Perform a soft delete by setting isDeleted to true
        address.isDeleted = true;
        await address.save();

        return res.status(200).json({
            message: 'Address deleted successfully',
            type: 'success',
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to delete address',
            error: error.message,
            type: 'error',
        });
    }
});


module.exports = {
    addAddress,
    updateAddress,
    getAddress,
    deleteAddress
};
