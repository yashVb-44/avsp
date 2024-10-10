const asyncHandler = require('express-async-handler');
const ServiceReminder = require('../models/serviceReminder');

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


module.exports = { addServiceReminder };