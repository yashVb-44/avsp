const expressAsyncHandler = require("express-async-handler");
const Booking = require("../models/booking");

const getTodayStats = expressAsyncHandler(async (req, res) => {
    try {
        const vendorId = req.user.id; // assuming vendor is authenticated and `req.user.id` holds the vendor ID
        const { date } = req.query
        const today = date || new Date().toISOString().split("T")[0]

        // Today's Bookings
        const todayBookings = await Booking.find({
            vendor: vendorId,
            pendingDate: today
        }).countDocuments();

        // Today's Bookings
        const todaySchedule = await Booking.find({
            vendor: vendorId,
            scheduleDate: today
        }).countDocuments();

        // Today's Completed Bookings
        const todayCompleted = await Booking.find({
            vendor: vendorId,
            // status: "6", // assuming "completed" status marks a completed booking
            completedDate: today
        }).countDocuments();

        // Today's Trips
        const todayTrips = await Booking.find({
            vendor: vendorId,
            collectedByGarageDate: today
        }).countDocuments();

        // Respond with today's stats
        return res.status(200).json({
            message: "Today's statistics retrieved successfully",
            type: "success",
            stats: {
                todayBookings,
                todayCompleted,
                todayTrips,
                todaySchedule
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Failed to retrieve today's statistics",
            error: error.message,
            type: "error"
        });
    }
});

module.exports = {
    getTodayStats
};
