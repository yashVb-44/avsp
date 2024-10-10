const mongoose = require('mongoose');

const myVehicleSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    image: {
        type: String
    },
    vehicleType: {
        type: String,
    },
    number: {
        type: String,
        unique: true,
    },
    brand: {
        type: String,
    },
    model: {
        type: String,
    },
    fuelType: {
        type: String,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('MyVehicle', myVehicleSchema);