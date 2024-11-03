const mongoose = require('mongoose');

const videoLibrarySchema = new mongoose.Schema({
    title: {
        type: String,
    },
    text: {
        type: String
    },
    link : {
        type : String
    },
    isActive: {
        type: Boolean,
        default: true
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('VideoLibrary', videoLibrarySchema);
