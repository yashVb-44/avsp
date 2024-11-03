const mongoose = require('mongoose')

const RatingSchema = mongoose.Schema({

    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking"
    },
    ownerModel: {
        type: String,
        enum: ['User', 'Vendor'],
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'ownerModel',
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vendor"
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    bookingType: {
        type: String,
        default: "0" // 0 = normal , 1= emergency
    },
    ratingBy: {
        type: String,
        default: "0", // 0 = by user, 1 = by vendor
    },
    rating: {
        type: String,
        default: "0"
    },
    ratingAvg: {
        type: Number,
        default: 0
    },
    quality: {
        type: Number,
        default: 0
    },
    responsiveness: {
        type: Number,
        default: 0
    },
    timeliness: {
        type: Number,
        default: 0
    },
    cost: {
        type: Number,
        default: 0
    },
    experience: {
        type: Number,
        default: 0
    },
    text: {
        type: String,
    },
    comment: {
        type: String,
    },
},
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('Rating', RatingSchema)