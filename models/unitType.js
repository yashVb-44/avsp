const mongoose = require('mongoose');

const unitTypeSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('UnitType', unitTypeSchema);
