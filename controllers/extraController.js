const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');

// Import your models
const Booking = require('../models/booking');
const User = require('../models/user');
const Vendor = require('../models/vendor');
const TempVendor = require('../models/tempVendor');
const Transaction = require('../models/transaction');
const Wallet = require('../models/wallet');
// const Category = require('../models/category');

const deleteAllData = asyncHandler(async (req, res) => {
    try {
        const { type } = req.query;

        if (type === undefined) {
            return res.status(400).json({
                message: 'Please provide a valid type parameter.',
                type: 'error',
            });
        }

        // Define the table deletion logic based on type
        if (type === 0) {
            // Delete all data from all tables
            await Promise.all([
                Booking.deleteMany({}),
                User.deleteMany({}),
                Vendor.deleteMany({}),
                TempVendor.deleteMany({}),
                Transaction.deleteMany({}),
                Wallet.deleteMany({}),
            ]);
            return res.status(200).json({
                message: 'All data deleted successfully.',
                type: 'success',
            });
        } else if (type === 1) {
            // Delete all booking data
            await Booking.deleteMany({});
            return res.status(200).json({
                message: 'All booking data deleted successfully.',
                type: 'success',
            });
        } else if (type === 2) {
            // Delete all user data
            await User.deleteMany({});
            return res.status(200).json({
                message: 'All user data deleted successfully.',
                type: 'success',
            });
        } else if (type === 3) {
            // Delete all vendor data
            await Vendor.deleteMany({});
            return res.status(200).json({
                message: 'All vendor data deleted successfully.',
                type: 'success',
            });
        } else if (type === 4) {
            // Delete all party data
            await TempVendor.deleteMany({});
            return res.status(200).json({
                message: 'All party data deleted successfully.',
                type: 'success',
            });
        } else if (type === 5) {
            // Delete all transaction data
            await Transaction.deleteMany({});
            return res.status(200).json({
                message: 'All transaction data deleted successfully.',
                type: 'success',
            });
        } else if (type === 6) {
            // Delete all transaction data
            await Wallet.deleteMany({});
            return res.status(200).json({
                message: 'All transaction data deleted successfully.',
                type: 'success',
            });
        } else {
            return res.status(400).json({
                message: 'Invalid type parameter. Valid values are 0 to 6.',
                type: 'error',
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Failed to delete data.',
            error: error.message,
            type: 'error',
        });
    }
});

module.exports = { deleteAllData };
