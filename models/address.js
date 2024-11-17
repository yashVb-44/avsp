const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const addressSchema = new Schema({
    type: {
        type: String,
        default: "1"
    },
    no: {
        type: String,
    },
    area: {
        type: String,
    },
    state: {
        type: String,
    },
    city: {
        type: String,
    },
    pincode: {
        type: String,
    },
    country: {
        type: String,
    },
    landmark: {
        type: String,
    },
    lat: {
        type: Number,
    },
    lng: {
        type: Number,
    },
    address: {
        type: String,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Address', addressSchema);
