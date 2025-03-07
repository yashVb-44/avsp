const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    serviceType: {
      type: String,
    },
    company: {
      type: String,
    },
    vehicleName: {
      type: String,
      required: true,
    },
    vehicleImage: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vehicle", vehicleSchema);
