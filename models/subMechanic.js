const mongoose = require('mongoose');

const subMechanicSchema = mongoose.Schema({
    name: {
        type: String,
    },
    mobileNo: {
        type: String,
    },
    joiningDate: {
        type: Date,
    },
    leavingDate: {
        type: Date,
        default: null,
    },
    paymentType: {
        type: String,
        default: "0"
    },
    staffType: {
        type: String,
        default: "0"
    },
    amount: {
        type: Number,
        default: 0
    },
    commissionPercentage: {
        type: Number,
        default: 0
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
    },
    status: {
        type: Boolean,
        default: true,
    },
    isDeactive: {
        type: Boolean,
        default: false
    },
    reason: {
        type: String,
    },
    addItem: {
        type: Boolean,
        default: false
    }, shareCard: {
        type: Boolean,
        default: false
    }, updateCard: {
        type: Boolean,
        default: false
    }, showCustomer: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('SubMechanic', subMechanicSchema);
