const asyncHandler = require('express-async-handler');
const Banner = require('../models/banner');
const upload = require('../config/mutler');
const removeUnwantedImages = require('../utils/deletingFiles');
const { generateImageUrls, ganerateOneLineImageUrls } = require('../utils/utils');

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

const getBannerForAdmin = async (req, res) => {
    try {
        const { search, page = 1, limit = 10 } = req.query; // Get search term, page, and limit from query parameters

        // Ensure page and limit are valid integers
        const pageNumber = parseInt(page) || 1;
        const limitNumber = parseInt(limit) || 10;

        // Build search query based on name, email, or mobile number
        let searchQuery = {};
        if (search && search.trim() !== '') {
            const regex = new RegExp(search.trim(), 'i'); // Case-insensitive partial match
            searchQuery = {
                $or: [
                    { name: regex },
                ]
            };
        }

        // Calculate total banners matching the query
        const totalBanners = await Banner.countDocuments(searchQuery);

        // Fetch paginated banners from the database
        let banners = await Banner.find(searchQuery)
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)
            .sort({ createdAt: -1 }); // Sort by creation date, newest first

        banners = banners.map((banner) => {
            let toShow = "";
            if (banner.type === "0") {
                toShow = "User";
            } else if (banner.type === "1") {
                toShow = "Vendor";
            } else if (banner.type === "2") {
                toShow = "All";
            }
            return {
                ...banner.toObject(), // Ensure we return a plain object
                toShow,
                image: ganerateOneLineImageUrls(banner.image, req)
            };
        });

        // Send response
        res.status(200).json({
            type: 'success',
            message: 'Banner list retrieved successfully',
            totalBanners,
            totalPages: Math.ceil(totalBanners / limitNumber),
            currentPage: pageNumber,
            banners,
        });
    } catch (error) {
        res.status(500).json({
            type: 'error',
            message: 'Error fetching user list',
            error: error.message
        });
    }
};

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

            if (banner.image) {
                removeUnwantedImages([banner.image]);
            }
            await Banner.findByIdAndDelete(id)

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
    getBannerForAdmin,
    updateBanner,
    deleteBanner,
};
