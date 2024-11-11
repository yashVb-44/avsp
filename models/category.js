const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
    },
    createdBy: {
        type: String,
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Category', categorySchema);
