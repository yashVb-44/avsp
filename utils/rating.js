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

module.exports = {
    checkRatingForBooking
}