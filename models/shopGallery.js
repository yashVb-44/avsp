const mongoose = require('mongoose');

const shopGallerySchema = mongoose.Schema({
    ownerImage: {
        type: String,
    },
    vehicleRepairImage: {
        type: String,
    },
    insideImage: {
        type: String,
    },
    outsideImage: {
        type: String,
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('ShopGallery', shopGallerySchema);
