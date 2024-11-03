const asyncHandler = require('express-async-handler');
const Report = require('../models/report');

// Add Report
const addReport = asyncHandler(async (req, res) => {
    try {
        const { id } = req.user
        const { bookingId, userId } = req.body
        const reportData = {
            ...req.body,
            vendor: id,
            user: userId,
            booking: bookingId
        };

        const existingReport = await Report.findOne({ booking: bookingId, vendor: id })

        if (existingReport) {
            return res.status(400).json({
                message: 'Report already exist for this user',
                type: 'error'
            });
        }

        const report = new Report(reportData);
        await report.save();

        return res.status(201).json({
            message: 'Report added successfully',
            type: 'success',
            report,
        });
    } catch (error) {

        return res.status(500).json({
            message: 'Failed to add report',
            error: error.message,
            type: 'error',
        });
    }
});

// Get Report by ID or all Reportes for the vendor
const getReport = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { id: vendorId, role } = req.user;
        let report;

        if (id) {
            // Get a specific report by ID
            report = role === "admin" ? await Report.findOne({ _id: id }) : await Report.findOne({ _id: id, vendor: vendorId });

            if (!report) {
                return res.status(404).json({
                    message: 'Report not found',
                    type: 'error',
                });
            }
        } else {
            // Get all reportes for the user
            role === "admin" ? report = await Report.find() : report = await Report.find({ vendor: vendorId });
        }

        return res.status(200).json({
            report,
            type: 'success',
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to retrieve report',
            error: error.message,
            type: 'error',
        });
    }
});

// Update Report
const updateReport = asyncHandler(async (req, res) => {
    try {
        const { id: vendorId, role } = req.user
        const { id } = req.params;
        const report = role === "admin" ? await Report.findOne({ _id: id, vendor: vendorId }) : await Report.findOne({ _id: id })

        if (!report) {
            return res.status(404).json({
                message: 'Report not found',
                type: 'error',
            });
        }

        // Update only the provided fields
        Object.assign(report, req.body);

        await report.save();

        return res.status(200).json({
            message: 'Report updated successfully',
            type: 'success',
            report,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to update report',
            error: error.message,
            type: 'error',
        });
    }
});

// Delete Report (by ID or all)
const deleteReport = asyncHandler(async (req, res) => {
    try {
        const { id: vendorId, role } = req.user
        const { id } = req.params;

        if (id) {
            // Delete a specific report by ID
            const report = role === "admin" ? await Report.findById(id) : await Report.findOne({ _id: id, vendor: vendorId })

            if (!report) {
                return res.status(404).json({
                    message: 'Report not found',
                    type: 'error',
                });
            }

            await Report.deleteOne({ _id: report._id });

            return res.status(200).json({
                message: 'Report deleted successfully',
                type: 'success',
            });
        } else {
            if (role === "admin") {
                await Report.deleteMany();
                return res.status(200).json({
                    message: 'All reports deleted successfully',
                    type: 'success',
                });
            } else {
                return res.status(403).json({
                    message: 'Unauthorized to delete all reports',
                    type: 'error',
                });
            }
        }
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to delete report',
            error: error.message,
            type: 'error',
        });
    }
});

module.exports = {
    addReport,
    updateReport,
    getReport,
    deleteReport
};
