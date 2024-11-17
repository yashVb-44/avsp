const Rating = require("../models/rating")

const checkRatingForBooking = async ({ bookingId }) => {
    try {
        const rating = await Rating.findOne({ booking: bookingId })
        if (rating) {
            return {
                isRating: true,
                rating
            }
        } else {
            return {
                isRating: false
            }
        }
    } catch (error) {
        return
    }
}


const getVendorRatings = async ({ vendorId }) => {
    try {

        // Fetch all ratings for the given vendor, where ratingBy is "0" (by user)
        const ratings = await Rating.find({ vendor: vendorId, ratingBy: "0" });

        // Calculate the average of ratingAvg and total user count
        const totalUsers = ratings.length;
        const totalRatingAvg = ratings.reduce((sum, rating) => sum + rating.ratingAvg, 0);
        const averageRating = (totalRatingAvg / totalUsers).toFixed(2); // Round to 2 decimal places

        return {
            // vendorId,
            averageRating,
            totalUsers,
        };
    } catch (error) {
        return
    }
};


module.exports = {
    checkRatingForBooking,
    getVendorRatings
}