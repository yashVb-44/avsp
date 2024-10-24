const mongoose = require('mongoose');

const gstSchema = new mongoose.Schema({
    name: {
        type: Number,
    },
    isActive: {
        type: Boolean,
        default: true
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Gst', gstSchema);
