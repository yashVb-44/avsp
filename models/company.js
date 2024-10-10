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
}, {
    timestamps: true,
});

module.exports = mongoose.model('Company', companySchema);
