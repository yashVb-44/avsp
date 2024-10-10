const asyncHandler = require('express-async-handler');
const ShopGallery = require('../models/shopGallery');
const upload = require('../config/mutler');
const removeUnwantedImages = require('../utils/deletingFiles');
const { generateImageUrls } = require('../utils/utils');

const uploadGallery = [
    upload.fields([
        { name: 'ownerImage', maxCount: 1 },
        { name: 'vehicleRepairImage', maxCount: 1 },
        { name: 'insideImage', maxCount: 1 },
        { name: 'outsideImage', maxCount: 1 },
    ]),
    asyncHandler(async (req, res) => {
        try {
            const vendorId = req.user.id;

            // Check if user is a vendor
            if (req.user.role !== 'vendor') {
                removeUnwantedImages(Object.values(req.files).flat().map(file => file.path));
                return res.status(403).json({
                    message: 'Forbidden',
                    type: 'error'
                });
            }

            const galleryData = {
                vendor: vendorId,
            };

            const existingGalleryData = await ShopGallery.findOne({ vendor: vendorId });

            if (existingGalleryData) {
                removeUnwantedImages(Object.values(req.files).flat().map(file => file.path));
                return res.status(400).json({
                    message: 'Gallery already exists',
                    type: 'error'
                });
            }

            if (req.files.ownerImage) {
                galleryData.ownerImage = req.files.ownerImage[0].path;
            }
            if (req.files.vehicleRepairImage) {
                galleryData.vehicleRepairImage = req.files.vehicleRepairImage[0].path;
            }
            if (req.files.insideImage) {
                galleryData.insideImage = req.files.insideImage[0].path;
            }
            if (req.files.outsideImage) {
                galleryData.outsideImage = req.files.outsideImage[0].path;
            }

            const gallery = new ShopGallery(galleryData);
            await gallery.save();

            return res.status(201).json({
                message: 'Gallery added successfully',
                type: 'success',
                gallery,
            });
        } catch (error) {
            removeUnwantedImages(Object.values(req.files).flat().map(file => file.path));
            return res.status(500).json({
                message: 'Failed to add gallery',
                error: error.message,
                type: 'error',
            });
        }
    }),
];

const getGallery = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        let galleries;

        if (id) {
            let gallery = await ShopGallery.findById(id).populate('vendor');
            if (!gallery) {
                return res.status(404).json({
                    message: 'Gallery not found',
                    type: 'error',
                });
            }

            if (user.role === 'admin' || (user.role === 'vendor' && gallery.vendor.equals(user.id))) {
                gallery = generateImageUrls(gallery.toObject(), req); // Convert to plain object and generate URLs
                return res.status(200).json({
                    gallery,
                    type: 'success',
                });
            } else {
                return res.status(403).json({
                    message: 'Forbidden',
                    type: 'error',
                });
            }
        } else {
            if (user.role === 'admin') {
                galleries = await ShopGallery.find().populate('vendor');
            } else if (user.role === 'vendor') {
                galleries = await ShopGallery.find({ vendor: user.id }).populate('vendor');
            } else {
                return res.status(403).json({
                    message: 'Forbidden',
                    type: 'error',
                });
            }

            galleries = galleries.map((gallery) => generateImageUrls(gallery.toObject(), req)); // Convert to plain object and generate URLs
            return res.status(200).json({
                galleries,
                type: 'success',
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to retrieve gallery',
            error: error.message,
            type: 'error',
        });
    }
});

const updateGallery = [
    upload.fields([
        { name: 'ownerImage', maxCount: 1 },
        { name: 'vehicleRepairImage', maxCount: 1 },
        { name: 'insideImage', maxCount: 1 },
        { name: 'outsideImage', maxCount: 1 },
    ]),
    asyncHandler(async (req, res) => {
        try {
            const { id } = req.params;
            const user = req.user;

            let gallery = await ShopGallery.findById(id).populate('vendor');

            if (!gallery) {
                removeUnwantedImages(Object.values(req.files).flat().map(file => file.path));
                return res.status(404).json({
                    message: 'Gallery not found',
                    type: 'error',
                });
            }

            // Allow updates if the user is an admin or the vendor who created the gallery
            if (user.role === 'admin' || (user.role === 'vendor' && gallery.vendor.equals(user.id))) {
                const oldImages = [];
                if (req.files.ownerImage) {
                    oldImages.push(gallery.ownerImage);
                    gallery.ownerImage = req.files.ownerImage[0].path;
                }
                if (req.files.vehicleRepairImage) {
                    oldImages.push(gallery.vehicleRepairImage);
                    gallery.vehicleRepairImage = req.files.vehicleRepairImage[0].path;
                }
                if (req.files.insideImage) {
                    oldImages.push(gallery.insideImage);
                    gallery.insideImage = req.files.insideImage[0].path;
                }
                if (req.files.outsideImage) {
                    oldImages.push(gallery.outsideImage);
                    gallery.outsideImage = req.files.outsideImage[0].path;
                }

                await gallery.save();
                removeUnwantedImages(oldImages);
                return res.status(200).json({
                    message: 'Gallery updated successfully',
                    type: 'success',
                    gallery,
                });
            } else {
                removeUnwantedImages(Object.values(req.files).flat().map(file => file.path));
                return res.status(403).json({
                    message: 'Forbidden',
                    type: 'error',
                });
            }
        } catch (error) {
            removeUnwantedImages(Object.values(req.files).flat().map(file => file.path));
            return res.status(500).json({
                message: 'Failed to update gallery',
                error: error.message,
                type: 'error',
            });
        }
    }),
];

module.exports = {
    uploadGallery,
    getGallery,
    updateGallery
};
