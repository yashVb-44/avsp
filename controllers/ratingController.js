const expressAsyncHandler = require('express-async-handler');
const Rating = require('../models/rating');
const Booking = require('../models/booking');
const { default: mongoose } = require('mongoose');
const { ganerateOneLineImageUrls } = require('../utils/utils');

const addRating = expressAsyncHandler(async (req, res) => {
    try {
        const { role, id } = req.user
        const { bookingId, experience, quality, cost, timeliness, responsiveness } = req.body;

        let ratingAvg = (experience + quality + cost + timeliness + responsiveness) / 5

        // Verify that booking exists
        const booking = await Booking.findById(bookingId);
        if (!booking && role === "user") {
            return res.status(404).json({
                message: "Booking not found",
                type: "error",
            });
        }

        let vendorId

        if (booking) {
            vendorId = booking.vendor
        }

        // Check if a rating already exists for this booking
        const existingRating = await Rating.findOne({ booking: bookingId });
        if (existingRating) {
            return res.status(400).json({
                message: "Rating already exists for this booking",
                type: "error",
            });
        }

        // Create new rating
        const newRating = new Rating({
            booking: bookingId,
            ownerModel: role === "user" ? "User" : "Vendor",
            owner: id,
            ratingAvg,
            ...req.body
        });

        if (role === "user") {
            newRating.vendor = vendorId
        }

        // Save the new rating
        await newRating.save();

        return res.status(201).json({
            message: "Rating added successfully",
            type: "success",
            rating: newRating,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Failed to add rating",
            error: error.message,
            type: "error",
        });
    }
});

const addRatingByVendor = expressAsyncHandler(async (req, res) => {
    try {
        const { role, id } = req.user
        const { userId, bookingId } = req.body;

        // Create new rating
        const newRating = new Rating({
            ownerModel: "Vendor",
            owner: id,
            vendor: id,
            user: userId,
            ratingBy: "1",
            booking: bookingId,
            ...req.body
        });

        // Save the new rating
        await newRating.save();

        return res.status(201).json({
            message: "Rating added successfully",
            type: "success",
            rating: newRating,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Failed to add rating",
            error: error.message,
            type: "error",
        });
    }
});

const getRatingsForVendor = expressAsyncHandler(async (req, res) => {
    try {
        const vendorId = req.user.id; // assuming vendor is logged in and `req.user` contains vendor info
        const { page = 1, limit = 10 } = req.query; // Default to page 1 and 10 ratings per page

        // Convert `page` and `limit` to integers
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);

        // Calculate total count of ratings for the vendor
        const totalRatings = await Rating.countDocuments({ vendor: vendorId, ratingBy: "0" });

        // Find ratings with pagination
        let ratings = await Rating.find({ vendor: vendorId, ratingBy: "0" })
            .populate("booking", "_id invoice scheduleDate")        // Populate booking details
            .populate("owner", "_id name mobileNo profileImage")          // Populate owner details (could be User or Vendor)
            .sort({ createdAt: -1 })    // Sort by most recent ratings
            .skip((pageNum - 1) * limitNum) // Skip documents for pagination
            .limit(limitNum);               // Limit the number of ratings per page

        // Calculate total pages
        const totalPages = Math.ceil(totalRatings / limitNum);

        ratings = ratings.map((rating) => {
            return {
                ...rating.toObject(),
                owner: {
                    ...rating.owner.toObject(),
                    profileImage: ganerateOneLineImageUrls(rating.owner.profileImage, req)
                }
            }
        })

        // Respond with ratings list and pagination info
        return res.status(200).json({
            message: "Ratings retrieved successfully",
            type: "success",
            currentPage: pageNum,
            totalPages,
            totalRatings,
            ratingsPerPage: ratings.length,
            ratings,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Failed to retrieve ratings",
            error: error.message,
            type: "error",
        });
    }
});

const getVendorRatings = expressAsyncHandler(async (req, res) => {
    try {
        const vendorId = req.params.vendorId; // Assuming vendor ID is passed in the request params
        const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
        const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page

        // Aggregation to count ratings by `ratingAvg` values (1 to 5 stars)
        const starCounts = await Rating.aggregate([
            {
                $match: { vendor: new mongoose.Types.ObjectId(vendorId), ratingBy: "0" } // Filter by vendor ID 
            },
            {
                $addFields: {
                    roundedRating: { $round: ["$ratingAvg", 0] } // Round ratingAvg to the nearest integer
                }
            },
            {
                $group: {
                    _id: "$roundedRating", // Group by rounded ratingAvg (1, 2, 3, 4, 5)
                    count: { $sum: 1 } // Count occurrences of each rounded star rating
                }
            }
        ]);

        // Calculate the overall average rating for the vendor
        const avgRatingData = await Rating.aggregate([
            { $match: { vendor: new mongoose.Types.ObjectId(vendorId), ratingBy: "0" } },
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: "$ratingAvg" }, // Calculate the overall average
                    totalRatings: { $sum: 1 } // Count the total number of ratings
                }
            }
        ]);

        const avgRating = avgRatingData.length > 0 ? avgRatingData[0].avgRating : 0;
        const totalRatings = avgRatingData.length > 0 ? avgRatingData[0].totalRatings : 0;

        // Format counts of each rating (1 through 5 stars)
        const ratingCounts = {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0
        };
        starCounts.forEach(({ _id, count }) => {
            ratingCounts[_id] = count;
        });

        // Paginated list of user ratings
        let userRatings = await Rating.find({ vendor: vendorId, ratingBy: "0" })
            .populate('owner', 'profileImage name mobileNo') // Populate owner name field (assumes `name` exists in `User` and `Vendor` models)
            // .select('ratingAvg quality responsiveness timeliness cost experience text createdAt') // Select fields to display
            .sort({ createdAt: -1 }) // Sort by most recent
            .skip((page - 1) * limit)
            .limit(limit);

        userRatings = userRatings.map((rating) => {
            return {
                ...rating.toObject(),
                owner: {
                    ...rating.owner.toObject(),
                    profileImage: ganerateOneLineImageUrls(rating.owner.profileImage, req)
                }
            }
        })

        return res.status(200).json({
            message: "Vendor ratings retrieved successfully",
            type: "success",
            ratings: {
                ratingCounts,
                avgRating: avgRating.toFixed(2), // Format to two decimal places
                totalRatings,
            },
            userRatings, // List of user ratings with pagination
            currentPage: page,
            totalPages: Math.ceil(totalRatings / limit),
            pageSize: limit
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Failed to retrieve vendor ratings",
            error: error.message,
            type: "error"
        });
    }
});



module.exports = { addRating, getRatingsForVendor, getVendorRatings, addRatingByVendor };

