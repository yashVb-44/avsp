const asyncHandler = require("express-async-handler");
const Vehicle = require("../models/vehicle");
const upload = require("../config/mutler");
const { generateImageUrls } = require("../utils/utils");

// Add Vehicle
const addVehicle = [
  upload.single("vehicleImage"),
  asyncHandler(async (req, res) => {
    try {
      const vehicleData = {
        ...req.body,
      };

      const existingVehicle = await Vehicle.findOne({ ...req.body });

      if (existingVehicle) {
        return res.status(400).json({
          message: "Vehicle already exist",
          type: "error",
        });
      }

      if (req.file) {
        vehicleData.vehicleImage = req.file.path;
      }

      const vehicle = new Vehicle(vehicleData);
      await vehicle.save();

      return res.status(201).json({
        message: "Vehicle added successfully",
        type: "success",
        vehicle,
      });
    } catch (error) {
      if (req.file) {
        removeUnwantedImages([req.file.path]);
      }
      return res.status(500).json({
        message: "Failed to add vehicle",
        error: error.message,
        type: "error",
      });
    }
  }),
];

// Get Vehicle by ID or all Companies for the user
const getVehicle = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId, role } = req.user;
    let vehicle;

    if (id) {
      // Get a specific vehicle by ID
      vehicle = await Vehicle.findOne({ _id: id });

      if (!vehicle) {
        return res.status(404).json({
          message: "Vehicle not found",
          type: "error",
        });
      }
      vehicle = generateImageUrls(vehicle.toObject(), req);
    } else {
      // Get all vehiclees for the user
      vehicle = await Vehicle.find({ isDeleted: false });
      vehicle = vehicle.map((vehicle) => {
        return generateImageUrls(vehicle.toObject(), req);
      });
    }

    return res.status(200).json({
      vehicle,
      type: "success",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to retrieve vehicle",
      error: error.message,
      type: "error",
    });
  }
});

const getVehicleForAdmin = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query; // Get search term, page, and limit from query parameters

    // Ensure page and limit are valid integers
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;

    let searchQuery = {};
    if (search && search.trim() !== "") {
      const regex = new RegExp(search.trim(), "i"); // Case-insensitive partial match
      searchQuery = {
        $or: [{ name: regex }],
      };
    }

    const totalCompanies = await Vehicle.countDocuments(searchQuery);

    let companies = await Vehicle.find(searchQuery)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .sort({ createdAt: -1 }); // Sort by creation date, newest first

    companies = companies.map((vehicle) => {
      let serviceTypeName = "";
      if (vehicle.serviceType === "1") {
        serviceTypeName = "2 wheeler";
      } else if (vehicle.serviceType === "2") {
        serviceTypeName = "3 wheeler";
      } else if (vehicle.serviceType === "3") {
        serviceTypeName = "4 wheeler";
      } else if (vehicle.serviceType === "4") {
        serviceTypeName = "Heavy Vehicle"; // Fixed spelling
      }
      return {
        ...vehicle.toObject(), // Ensure we return a plain object
        serviceTypeName,
      };
    });

    companies = companies.map((vehicle) => {
      return generateImageUrls(vehicle, req);
    });

    // Send response
    res.status(200).json({
      type: "success",
      message: "Companies list retrieved successfully",
      totalCompanies,
      totalPages: Math.ceil(totalCompanies / limitNumber),
      currentPage: pageNumber,
      companies,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      type: "error",
      message: "Error fetching companies list",
      error: error.message,
    });
  }
};

// Get Vehicle by company ID
const getVehicleByCompany = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let vehicle;

    if (!id) {
      return res.status(400).json({
        message: "Company ID is required",
        type: "error",
      });
    }

    vehicle = await Vehicle.find({ company: id });

    vehicle = vehicle.map((vehicle) => {
      return generateImageUrls(vehicle.toObject(), req);
    });

    return res.status(200).json({
      vehicle,
      type: "success",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to retrieve vehicle",
      error: error.message,
      type: "error",
    });
  }
});

// Update Vehicle
const updateVehicle = [
  upload.single("vehicleImage"),
  asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const vehicle = await Vehicle.findOne({ _id: id });

      if (!vehicle) {
        return res.status(404).json({
          message: "Vehicle not found",
          type: "error",
        });
      }

      const updateData = {
        ...req.body,
        vehicleImage: req.file?.path || vehicle.vehicleImage,
      };

      // Update only the provided fields
      Object.assign(vehicle, updateData);

      await vehicle.save();

      return res.status(200).json({
        message: "Vehicle updated successfully",
        type: "success",
        vehicle,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Failed to update vehicle",
        error: error.message,
        type: "error",
      });
    }
  }),
];

// Delete Vehicle (by ID or all)
const deleteVehicle = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (id) {
      // Delete a specific vehicle by ID
      const vehicle = await Vehicle.findById(id);

      if (!vehicle) {
        return res.status(404).json({
          message: "Vehicle not found",
          type: "error",
        });
      }

      vehicle.isDeleted = true;
      // await vehicle.findByIdAndDelete(id)
      await vehicle.save();

      return res.status(200).json({
        message: "Vehicle deleted successfully",
        type: "success",
      });
    } else {
      // Delete all companies
      // await Vehicle.deleteMany();

      return res.status(200).json({
        message: "All companies deleted successfully",
        type: "success",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to delete vehicle",
      error: error.message,
      type: "error",
    });
  }
});

module.exports = {
  addVehicle,
  updateVehicle,
  getVehicle,
  deleteVehicle,
  getVehicleForAdmin,
  getVehicleByCompany,
};
