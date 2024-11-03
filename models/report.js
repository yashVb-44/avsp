const mongoose = require('mongoose')

const ReportSchema = mongoose.Schema({

    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking"
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vendor"
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    title: {
        type: String
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

module.exports = mongoose.model('Report', ReportSchema)