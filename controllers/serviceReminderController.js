const asyncHandler = require('express-async-handler');
const ServiceReminder = require('../models/serviceReminder');
const expressAsyncHandler = require('express-async-handler');

const addServiceReminder = asyncHandler(async (req, res) => {
    try {
        const vendorId = req.user.id;
        const { booking } = req.body

        const serviceData = {
            ...req.body,
            vendor: vendorId,
        };
        const existingService = await ServiceReminder.findOne({ vendor: vendorId, booking: booking })

        if (existingService) {
            return res.status(400).json({
                message: 'Service reminder already exist',
                type: 'error'
            });
        }

        const service = new ServiceReminder(serviceData);
        await service.save();

        return res.status(201).json({
            message: 'Service reminder added successfully',
            type: 'success',
            service,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to add Service reminder',
            error: error.message,
            type: 'error'
        });
    }
});

const getServiceReminders = expressAsyncHandler(async (req, res) => {
    try {
        const vendorId = req.user.id; // assuming vendor ID is passed in the request params
        const { monthYear, date } = req.query; // query parameters for filtering

        // Build the filter object for vendor
        const filter = { vendor: vendorId };
        // Apply filtering based on month and year or specific date
        if (monthYear) {
            // Match reminders for the given month and year (YYYY-MM)
            filter.date = {
                $regex: new RegExp(`^${monthYear}`) // Matches the YYYY-MM pattern
            };
        } else if (date) {
            // Direct match on the exact date (YYYY-MM-DD)
            filter.date = date;
        }
        // Query the database with the constructed filter
        const serviceReminders = await ServiceReminder.find(filter)
            .populate({
                path: 'booking',
                select: 'myVehicle user invoice',
                populate: [
                    {
                        path: 'user', // Expands user within booking
                        select: 'name email mobileNo' // Specify fields of user you need
                    },
                    {
                        path: 'myVehicle', // Expands myVehicle within booking
                        select: 'make model year number'
                    },
                    {
                        path: 'invoice', // Expands myVehicle within booking
                        select: 'invoiceCode'
                    }
                ]
            })
            .sort({ date: 1 }); // Sort by date in ascending order

        return res.status(200).json({
            message: "Service reminders retrieved successfully",
            type: "success",
            serviceReminders
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Failed to retrieve service reminders",
            error: error.message,
            type: "error"
        });
    }
});

const deleteServiceReminder = expressAsyncHandler(async (req, res) => {
    try {
        const vendorId = req.user.id; // assuming the authenticated vendor's ID is stored in req.user.id
        const { reminderId } = req.params; // assuming reminder ID is passed as a URL parameter

        // Find the reminder by ID and ensure it belongs to the vendor
        const reminder = await ServiceReminder.findOneAndDelete({
            _id: reminderId,
            vendor: vendorId
        });

        if (!reminder) {
            return res.status(404).json({
                message: "Service reminder not found or does not belong to this vendor",
                type: "error"
            });
        }

        return res.status(200).json({
            message: "Service reminder deleted successfully",
            type: "success",
            // reminder
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Failed to delete service reminder",
            error: error.message,
            type: "error"
        });
    }
});

module.exports = { addServiceReminder, getServiceReminders, deleteServiceReminder };