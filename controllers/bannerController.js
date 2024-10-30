const asyncHandler = require('express-async-handler');
const Banner = require('../models/banner');
const upload = require('../config/mutler');
const removeUnwantedImages = require('../utils/deletingFiles');
const { generateImageUrls } = require('../utils/utils');

// Add Banner
const addBanner = [
    upload.single('bannerImage'),
    asyncHandler(async (req, res) => {
        try {

            // Prepare banner data
            const bannerData = {
                ...req.body,
            };

            // Handle image upload
            if (req.file) {
                bannerData.image = req.file.path;
            }

            // Create and save the banner
            const banner = await Banner.create(bannerData);

            return res.status(201).json({
                message: 'Banner added successfully',
                type: 'success',
                banner,
            });
        } catch (error) {
            if (req.file) {
                removeUnwantedImages([req.file.path]);
            }
            return res.status(500).json({
                message: 'Failed to add banner',
                error: error.message,
                type: 'error',
            });
        }
    }),
];

// Get Banner(s)
const getBanners = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.user
        let banners;

        if (id) {
            banners = await Banner.findById(id)
            if (!banners) {
                return res.status(404).json({
                    message: 'Banner not found',
                    type: 'error',
                });
            }

            banners = generateImageUrls(banners.toObject(), req); // Convert to plain object and generate URLs
        } else {
            if (role === 'admin') {
                banners = await Banner.find();
            } else {
                banners = await Banner.find({
                    isActive: true,
                    type: { $in: role === 'user' ? ["0", "2"] : ["1", "2"] }
                });

            }

            banners = banners.map((banner) => generateImageUrls(banner.toObject(), req)); // Convert to plain object and generate URLs
        }

        return res.status(200).json({
            banners,
            type: 'success',
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: 'Failed to retrieve banners',
            error: error.message,
            type: 'error',
        });
    }
});

// Update Banner
const updateBanner = [
    upload.single('bannerImage'),
    asyncHandler(async (req, res) => {
        try {
            const { id } = req.params;

            const banner = await Banner.findById(id);
            if (!banner) {
                if (req.file) {
                    removeUnwantedImages([req.file.path]);
                }
                return res.status(404).json({
                    message: 'Banner not found',
                    type: 'error',
                });
            }

            // Update banner fields with provided data
            Object.assign(banner, req.body);

            // Handle image update
            if (req.file) {
                const oldImage = banner.image;
                banner.image = req.file.path;
                if (oldImage) {
                    removeUnwantedImages([oldImage]);
                }
            }

            await banner.save();

            return res.status(200).json({
                message: 'Banner updated successfully',
                type: 'success',
                banner,
            });
        } catch (error) {
            if (req.file) {
                removeUnwantedImages([req.file.path]);
            }
            return res.status(500).json({
                message: 'Failed to update banner',
                error: error.message,
                type: 'error',
            });
        }
    }),
];

// Delete Banner
const deleteBanner = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (id) {
            // Delete specific banner by ID
            const banner = await Banner.findById(id);
            if (!banner) {
                return res.status(404).json({
                    message: 'Banner not found',
                    type: 'error',
                });
            }

            // Check if the banner belongs to the user or if the user is an admin
            if (banner.userId.toString() !== userId && !isAdmin) {
                return res.status(403).json({
                    message: 'Forbidden',
                    type: 'error',
                });
            }

            if (banner.image) {
                removeUnwantedImages([banner.image]);
            }
            await banner.remove();

            return res.status(200).json({
                message: 'Banner deleted successfully',
                type: 'success',
            });
        } else {
            // Delete all banners
            if (isAdmin) {
                // Admin deletes all banners
                const banners = await Banner.find();
                const imagesToDelete = banners.map((v) => v.image).filter(Boolean);
                if (imagesToDelete.length > 0) {
                    removeUnwantedImages(imagesToDelete);
                }

                await Banner.deleteMany();

                return res.status(200).json({
                    message: 'All banners deleted successfully',
                    type: 'success',
                });
            } else {
                // Non-admin user deletes all their own banners
                const banners = await Banner.find({ userId });
                if (banners.length === 0) {
                    return res.status(404).json({
                        message: 'No banners found',
                        type: 'error',
                    });
                }

                const imagesToDelete = banners.map((v) => v.image).filter(Boolean);
                if (imagesToDelete.length > 0) {
                    removeUnwantedImages(imagesToDelete);
                }

                await Banner.deleteMany({ userId });

                return res.status(200).json({
                    message: 'All banners deleted successfully',
                    type: 'success',
                });
            }
        }
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to delete banner(s)',
            error: error.message,
            type: 'error',
        });
    }
});

module.exports = {
    addBanner,
    getBanners,
    updateBanner,
    deleteBanner,
};
