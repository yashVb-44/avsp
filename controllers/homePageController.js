const expressAsyncHandler = require("express-async-handler");
const Booking = require("../models/booking");
const Transaction = require("../models/transaction");
const { default: mongoose } = require("mongoose");

// const getTodayStats = expressAsyncHandler(async (req, res) => {
//     try {
//         const vendorId = req.user.id; // assuming vendor is authenticated and `req.user.id` holds the vendor ID
//         const { date } = req.query
//         const today = date || new Date().toISOString().split("T")[0]
//         // Today's Bookings
//         const todayBookings = await Booking.find({
//             vendor: vendorId,
//             pendingDate: today
//         }).countDocuments();

//         // Today's Bookings
//         const todaySchedule = await Booking.find({
//             vendor: vendorId,
//             scheduleDate: today
//         }).countDocuments();

//         // Today's Completed Bookings
//         const todayCompleted = await Booking.find({
//             vendor: vendorId,
//             // status: "6", // assuming "completed" status marks a completed booking
//             completedDate: today
//         }).countDocuments();

//         // Today's Trips
//         const todayTrips = await Booking.find({
//             vendor: vendorId,
//             collectedByGarageDate: today
//         }).countDocuments();

//         // Respond with today's stats
//         return res.status(200).json({
//             message: "Today's statistics retrieved successfully",
//             type: "success",
//             stats: {
//                 todayBookings,
//                 todayCompleted,
//                 todayTrips,
//                 todaySchedule
//             }
//         });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({
//             message: "Failed to retrieve today's statistics",
//             error: error.message,
//             type: "error"
//         });
//     }
// });

const getTodayStats = expressAsyncHandler(async (req, res) => {
    try {
        const vendorId = req.user.id;
        const { date } = req.query;

        // IST offset in minutes (+5:30)
        const IST_OFFSET = 330;

        // Get current date in UTC
        const now = new Date();

        // Calculate IST start and end of day
        const startOfDayIST = new Date(
            Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
        );
        startOfDayIST.setUTCMinutes(startOfDayIST.getUTCMinutes() + IST_OFFSET);

        const endOfDayIST = new Date(startOfDayIST);
        endOfDayIST.setUTCHours(23, 59, 59, 999);

        // Convert IST start and end to UTC for query
        const startOfDayUTC = new Date(startOfDayIST.getTime() - IST_OFFSET * 60000);
        const endOfDayUTC = new Date(endOfDayIST.getTime() - IST_OFFSET * 60000);
        // Today's Bookings
        const todayBookings = await Booking.find({
            vendor: vendorId,
            pendingDate: date || new Date().toISOString().split("T")[0]
        }).countDocuments();

        // Today's Scheduled Bookings
        const todaySchedule = await Booking.find({
            vendor: vendorId,
            scheduleDate: date || new Date().toISOString().split("T")[0]
        }).countDocuments();

        // Today's Completed Bookings
        const todayCompleted = await Booking.find({
            vendor: vendorId,
            completedDate: date || new Date().toISOString().split("T")[0]
        }).countDocuments();

        // Today's Trips
        const todayTrips = await Booking.find({
            vendor: vendorId,
            collectedByGarageDate: date || new Date().toISOString().split("T")[0]
        }).countDocuments();

        // Today's Earnings
        const transactions = await Transaction.aggregate([
            {
                $match: {
                    owner: new mongoose.Types.ObjectId(vendorId), // Filter by vendor ID
                    amountType: "1", // Received amount
                    createdAt: { $gte: startOfDayUTC, $lte: endOfDayUTC }
                }
            },
            {
                $group: {
                    _id: null,
                    totalTodayEarnings: { $sum: "$addOnAmount" }, // Sum up the amounts
                    amount: { $sum: "$amount" },
                    totalAmount: { $sum: "$totalAmount" },
                }
            }
        ]);
        const totalTodayEarnings = transactions[0]?.totalTodayEarnings || 0;
        const totalAmountReceived = transactions[0]?.amount || 0;
        const totalAmount = transactions[0]?.totalAmount || 0;

        // Respond with today's stats
        return res.status(200).json({
            message: "Today's statistics retrieved successfully",
            type: "success",
            stats: {
                todayBookings,
                todayCompleted,
                todayTrips,
                todaySchedule,
                totalTodayEarnings,
                totalAmountReceived,
                totalAmount
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


module.exports = {
    getTodayStats
};
