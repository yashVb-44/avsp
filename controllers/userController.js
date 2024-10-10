const asyncHandler = require('express-async-handler');
const User = require('../models/user');
const upload = require('../config/mutler');
const removeUnwantedImages = require('../utils/deletingFiles');

// Get User Profile
const getUserProfile = asyncHandler(async (req, res) => {
    try {
        const userId = req.params.id || req.user.id;
        // Check if the user is an admin or the user themselves
        if (req.user.role !== 'admin' && req.user.id !== userId) {
            return res.status(403).json({
                message: 'Forbidden',
                type: 'error',
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: 'User not found',
                type: 'error',
            });
        }

        // Generate profile image URL
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        if (user.profileImage) {
            user.profileImage = `${baseUrl}/${user.profileImage}`;
        }

        return res.status(200).json({
            user,
            type: 'success',
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to retrieve user profile',
            error: error.message,
            type: 'error',
        });
    }
});

// Update User Profile
const updateUserProfile = [
    upload.single('profileImage'),
    asyncHandler(async (req, res) => {
        try {
            const userId = req.params.id || req.user.id;

            // Check if the user is an admin or the user themselves
            if (req.user.role !== 'admin' && req.user.id !== userId) {
                if (req.file) {
                    removeUnwantedImages([req.file.path]);
                }
                return res.status(403).json({
                    message: 'Forbidden',
                    type: 'error',
                });
            }
            const user = await User.findById(userId);
            if (!user) {
                if (req.file) {
                    removeUnwantedImages([req.file.path]);
                }
                return res.status(404).json({
                    message: 'User not found',
                    type: 'error',
                });
            }

            // Update fields
            const { name, mobileNo, email, gender, dateOfBirth } = req.body;

            if (name) user.name = name;
            if (mobileNo) user.mobileNo = mobileNo;
            if (email) user.email = email;
            if (gender) user.gender = gender;
            if (dateOfBirth) user.dateOfBirth = dateOfBirth;

            // Update profile image if provided
            if (req.file) {
                const oldProfileImage = user.profileImage;
                user.profileImage = req.file.path;
                if (oldProfileImage) {
                    removeUnwantedImages([oldProfileImage]);
                }
            }

            await user.save();

            return res.status(200).json({
                message: 'User profile updated successfully',
                type: 'success',
                user,
            });
        } catch (error) {
            if (req.file) {
                removeUnwantedImages([req.file.path]);
            }
            return res.status(500).json({
                message: 'Failed to update user profile',
                error: error.message,
                type: 'error',
            });
        }
    }),
];


module.exports = {
    getUserProfile,
    updateUserProfile,
};
