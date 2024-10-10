const mongoose = require('mongoose');

const additionalServiceSchema = mongoose.Schema({
    isPickUp: {
        type: Boolean,
        default: false,
    },
    isDropOut: {
        type: Boolean,
        default: false,
    },
    pickUpTimeSlot: [{
        type: String,
    }],
    dropOutTimeSlot: [{
        type: String,
    }],
    pickUpCharge: {
        type: Number,
        default: 0,
    },
    dropOutCharge: {
        type: Number,
        default: 0,
    },
    pickUpRadius: {
        type: Number, // Radius in kilometers
        default: 0,
    },
    dropOutRadius: {
        type: Number, // Radius in kilometers
        default: 0,
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('AdditionalService', additionalServiceSchema);
