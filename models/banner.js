const mongoose = require('mongoose');

const BannerSchema = new mongoose.Schema({
    name: { type: String },
    image: { type: String },                   // URL of the banner image
    type: { type: String, enum: ['0', '1', '2'], default: "0" }, // Visibility type
    isActive: { type: Boolean, default: true },                // To toggle banner visibility
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Banner', BannerSchema);
