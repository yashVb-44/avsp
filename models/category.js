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
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Category', categorySchema);
