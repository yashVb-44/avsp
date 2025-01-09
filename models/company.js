const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    name: {
        type: String,
    },
    serviceType: {
        type: String,
    },
    companyName: {
        type: String,
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Company', companySchema);
