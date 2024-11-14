// models/tempVendor.js
const mongoose = require('mongoose');

const tempVendorSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    mobileNo: {
        type: String,
    },
    gst: {
        type: String,
    },
    pan: {
        type: String
    },
    area: {
        type: String,
    },
    state: {
        type: String,
    },
    city: {
        type: String
    },
    pincode: {
        type: String
    },
    role: {
        type: String,
        default: "vendor" // Changed role field to default to "vendor"
    },
    bankName: String,
    accountNumber: String,
    ifscCode: String,
    branchName: String,
    branchAddress: String
}, {
    timestamps: true,
});

module.exports = mongoose.model('TempVendor', tempVendorSchema);
