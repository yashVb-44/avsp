const asyncHandler = require('express-async-handler');
const MyVehicle = require('../models/myVehicle');
const upload = require('../config/mutler');
const removeUnwantedImages = require('../utils/deletingFiles');
const { generateImageUrls } = require('../utils/utils');
const Vendor = require('../models/vendor');

// Add Vehicle
const addVehicle = [
    upload.single('myVehicleImage'),
    asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;
            const { number } = req.body;

            // Check if a vehicle with the same number already exists for the user
            const existingVehicle = await MyVehicle.findOne({ number, userId, isDeleted: false });
            if (existingVehicle) {
                req.file && removeUnwantedImages([req.file.path]);
                return res.status(400).json({
                    message: 'Vehicle with this number already exists',
                    type: 'error',
                });
            }

            // Prepare vehicle data
            const vehicleData = {
                ...req.body,
                userId,
                isDeleted: false
            };

            // Handle image upload
            if (req.file) {
                vehicleData.image = req.file.path;
            }

            // Create and save the vehicle
            const vehicle = await MyVehicle.create(vehicleData);

            return res.status(201).json({
                message: 'Vehicle added successfully',
                type: 'success',
                vehicle,
            });
        } catch (error) {
            if (req.file) {
                removeUnwantedImages([req.file.path]);
            }
            return res.status(500).json({
                message: 'Failed to add vehicle',
                error: error.message,
                type: 'error',
            });
        }
    }),
];

// Add Vehicle by vendor
const addVehicleByVendor = [
    upload.single("myVehicleImage"),
    asyncHandler(async (req, res) => {
        try {
            const vendorId = req.user.id;
            const { number, userId } = req.body;

            // Check if a vehicle with the same number already exists for the user
            const existingVehicle = await MyVehicle.findOne({ number, userId, isDeleted: false });
            if (existingVehicle) {
                req.file && removeUnwantedImages([req.file?.path]);
                return res.status(400).json({
                    message: "Vehicle with this number already exists",
                    type: "error",
                });
            }

            // Prepare vehicle data
            const vehicleData = {
                ...req.body,
                userId,
                vendorId,
                isDeleted: false
            };

            // Handle image upload
            if (req.file) {
                vehicleData.image = req.file.path;
            }

            // Create and save the vehicle
            const vehicle = await MyVehicle.create(vehicleData);

            return res.status(201).json({
                message: "Vehicle added successfully",
                type: "success",
                vehicle,
            });
        } catch (error) {
            if (req.file) {
                removeUnwantedImages([req.file.path]);
            }
            console.log(error)
            return res.status(500).json({
                message: "Failed to add vehicle",
                error: error.message,
                type: "error",
            });
        }
    }),
];

// Get Vehicle(s)
const getVehicles = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        let vehicles;

        if (id) {
            vehicles = await MyVehicle.findById(id).populate('userId');
            if (!vehicles) {
                return res.status(404).json({
                    message: 'Vehicle not found',
                    type: 'error',
                });
            }

            if (req.user.role !== 'admin' && !vehicles.userId.equals(req.user.id)) {
                return res.status(403).json({
                    message: 'Forbidden',
                    type: 'error',
                });
            }

            vehicles = generateImageUrls(vehicles.toObject(), req); // Convert to plain object and generate URLs
        } else {
            if (req.user.role === 'admin') {
                vehicles = await MyVehicle.find({ isDeleted: false }).populate('userId');
            } else {
                vehicles = await MyVehicle.find({ userId: req.user.id, isDeleted: false }).populate('userId');
            }

            vehicles = vehicles.map((vehicle) => generateImageUrls(vehicle.toObject(), req)); // Convert to plain object and generate URLs
        }

        return res.status(200).json({
            vehicles,
            type: 'success',
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to retrieve vehicles',
            error: error.message,
            type: 'error',
        });
    }
});

// Get Vehicle(s)
const getUserVehiclesByVendor = asyncHandler(async (req, res) => {
    try {
        const { id, userId } = req.body;
        let vehicles;

        if (id) {
            vehicles = await MyVehicle.findById(id).populate('userId');
            if (!vehicles) {
                return res.status(404).json({
                    message: 'Vehicle not found',
                    type: 'error',
                });
            }

            vehicles = generateImageUrls(vehicles.toObject(), req); // Convert to plain object and generate URLs
        } else {
            if (req.user.role === 'vendor') {
                vehicles = await MyVehicle.find({ userId, isDeleted: false }).populate('userId');
            }

            vehicles = vehicles.map((vehicle) => generateImageUrls(vehicle.toObject(), req)); // Convert to plain object and generate URLs
        }

        return res.status(200).json({
            vehicles,
            type: 'success',
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to retrieve vehicles',
            error: error.message,
            type: 'error',
        });
    }
});

// Update Vehicle
const updateVehicle = [
    upload.single('myVehicleImage'),
    asyncHandler(async (req, res) => {
        try {
            const { id } = req.params;
            const { number } = req.body;
            const userId = req.user.id;

            const vehicle = await MyVehicle.findById(id);
            if (!vehicle) {
                if (req.file) {
                    removeUnwantedImages([req.file.path]);
                }
                return res.status(404).json({
                    message: 'Vehicle not found',
                    type: 'error',
                });
            }

            // Check if a vehicle with the same number already exists for the user
            if (number) {
                const existingVehicle = await MyVehicle.findOne({ number, userId });
                if (existingVehicle && existingVehicle._id.toString() !== id) {
                    if (req.file) {
                        removeUnwantedImages([req.file.path]);
                    }
                    return res.status(400).json({
                        message: 'Vehicle with this number already exists',
                        type: 'error',
                    });
                }
            }

            // Update vehicle fields with provided data
            Object.assign(vehicle, req.body);

            // Handle image update
            if (req.file) {
                const oldImage = vehicle.image;
                vehicle.image = req.file.path;
                if (oldImage) {
                    removeUnwantedImages([oldImage]);
                }
            }

            await vehicle.save();

            return res.status(200).json({
                message: 'Vehicle updated successfully',
                type: 'success',
                vehicle,
            });
        } catch (error) {
            if (req.file) {
                removeUnwantedImages([req.file.path]);
            }
            return res.status(500).json({
                message: 'Failed to update vehicle',
                error: error.message,
                type: 'error',
            });
        }
    }),
];

// Delete Vehicle
const deleteVehicle = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (id) {
            // Delete specific vehicle by ID
            const vehicle = await MyVehicle.findById(id);
            if (!vehicle) {
                return res.status(404).json({
                    message: 'Vehicle not found',
                    type: 'error',
                });
            }

            // Check if the vehicle belongs to the user or if the user is an admin
            if (vehicle.userId.toString() !== userId && !isAdmin) {
                return res.status(403).json({
                    message: 'Forbidden',
                    type: 'error',
                });
            }

            if (vehicle.image) {
                removeUnwantedImages([vehicle.image]);
            }
            // await vehicle.remove();
            vehicle.isDeleted = true;
            await vehicle.save();

            return res.status(200).json({
                message: 'Vehicle deleted successfully',
                type: 'success',
            });
        } else {
            // Delete all vehicles
            if (isAdmin) {
                // Admin deletes all vehicles
                const vehicles = await MyVehicle.find();
                const imagesToDelete = vehicles.map((v) => v.image).filter(Boolean);
                if (imagesToDelete.length > 0) {
                    removeUnwantedImages(imagesToDelete);
                }

                // await MyVehicle.deleteMany();
                await MyVehicle.updateMany({}, { $set: { isDeleted: true } });

                return res.status(200).json({
                    message: 'All vehicles deleted successfully',
                    type: 'success',
                });
            } else {
                // Non-admin user deletes all their own vehicles
                const vehicles = await MyVehicle.find({ userId });
                if (vehicles.length === 0) {
                    return res.status(404).json({
                        message: 'No vehicles found',
                        type: 'error',
                    });
                }

                const imagesToDelete = vehicles.map((v) => v.image).filter(Boolean);
                if (imagesToDelete.length > 0) {
                    removeUnwantedImages(imagesToDelete);
                }

                // await MyVehicle.deleteMany({ userId });
                await MyVehicle.updateMany({ userId }, { $set: { isDeleted: true } });

                return res.status(200).json({
                    message: 'All vehicles deleted successfully',
                    type: 'success',
                });
            }
        }
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to delete vehicle(s)',
            error: error.message,
            type: 'error',
        });
    }
});

const searchVehicleByNumber = asyncHandler(async (req, res) => {
    try {
        const { vehicleNumber } = req.query; // Query parameter for the vehicle number
        const vendorId = req.user.id; // Logged-in vendor ID

        const vendor = await Vendor.findById(vendorId)
        const vendorServiceType = vendor.serviceType; // Vendor's service type
        if (!vehicleNumber) {
            return res.status(400).json({
                message: 'Vehicle number is required',
                type: 'error',
            });
        }

        // Find the vendor's vehicles with matching vehicleType and vehicleNumber
        const vehicles = await MyVehicle.find({
            vehicleType: vendorServiceType,
            number: { $regex: new RegExp(vehicleNumber, 'i') },
            isDeleted: false,
        }).populate('userId')

        if (vehicles.length === 0) {
            return res.status(404).json({
                message: 'No vehicles found matching the criteria',
                type: 'error',
            });
        }

        return res.status(200).json({
            message: 'Vehicles retrieved successfully',
            type: 'success',
            data: vehicles,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to search vehicles',
            error: error.message,
            type: 'error',
        });
    }
});


module.exports = {
    addVehicle,
    getVehicles,
    updateVehicle,
    deleteVehicle,
    addVehicleByVendor,
    getUserVehiclesByVendor,
    searchVehicleByNumber
};
