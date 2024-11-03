const expressAsyncHandler = require('express-async-handler');
const VideoLibrary = require('../models/videoLibrary');

// Controller to add a new video
const addVideo = expressAsyncHandler(async (req, res) => {
    try {
        const { title, text, link, isActive } = req.body;

        // Create and save the new video
        const video = new VideoLibrary({
            ...req.body
        });
        await video.save();

        return res.status(201).json({
            message: "Video added successfully",
            type: "success",
            video
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Failed to add video",
            error: error.message,
            type: "error"
        });
    }
});

// Controller to retrieve all videos
const getAllVideos = expressAsyncHandler(async (req, res) => {
    try {
        const { role } = req.user;

        const videos = role === "admin" ? await VideoLibrary.find().sort({ createdAt: -1 }) : await VideoLibrary.find({ isActive: true }).sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Videos retrieved successfully",
            type: "success",
            videos
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Failed to retrieve videos",
            error: error.message,
            type: "error"
        });
    }
});

// Controller to update a video by ID
const updateVideo = expressAsyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params;
        const updates = req.body;

        // Find video by ID and update
        const video = await VideoLibrary.findByIdAndUpdate(videoId, updates, { new: true });

        if (!video) {
            return res.status(404).json({
                message: "Video not found",
                type: "error"
            });
        }

        return res.status(200).json({
            message: "Video updated successfully",
            type: "success",
            video
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Failed to update video",
            error: error.message,
            type: "error"
        });
    }
});

// Controller to delete a video by ID
const deleteVideo = expressAsyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params;

        // Find video by ID and delete
        const video = await VideoLibrary.findByIdAndDelete(videoId);

        if (!video) {
            return res.status(404).json({
                message: "Video not found",
                type: "error"
            });
        }

        return res.status(200).json({
            message: "Video deleted successfully",
            type: "success",
            video
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Failed to delete video",
            error: error.message,
            type: "error"
        });
    }
});

module.exports = {
    addVideo,
    getAllVideos,
    updateVideo,
    deleteVideo
};
