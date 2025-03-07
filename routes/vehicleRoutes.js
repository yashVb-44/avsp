const express = require("express");
const router = express.Router();
const { authenticateAndAuthorize } = require("../middleware/authMiddleware");
const {
  addVehicle,
  getVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleForAdmin,
  getVehicleByCompany,
} = require("../controllers/vehicleController");

router.post("/add", authenticateAndAuthorize(["admin"]), addVehicle);
router.get(
  "/list/forAdmin",
  authenticateAndAuthorize(["admin"]),
  getVehicleForAdmin
);
router.get(
  "/:id?",
  authenticateAndAuthorize(["admin", "user", "vendor"]),
  getVehicle
);
router.get(
  "/details/companyVehicle",
  authenticateAndAuthorize(["admin", "user", "vendor"]),
  getVehicleByCompany
);
router.put("/update/:id", authenticateAndAuthorize(["admin"]), updateVehicle);
router.delete("/:id?", authenticateAndAuthorize(["admin"]), deleteVehicle);

module.exports = router;
