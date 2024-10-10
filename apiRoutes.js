// apiRoutes.js
const express = require('express');
const app = express();
const router = express.Router();

const userRoutes = require('./routes/userRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const adminRoutes = require('./routes/adminRoutes');
const shopServiceRoutes = require('./routes/shopServiceRoutes');
const emergencyServiceRoutes = require('./routes/emergencyServiceRoutes');
const garageRoutes = require('./routes/garageRoutes');
const serviceRateRoute = require('./routes/serviceRateRoute');
const additionalServiceRoutes = require('./routes/additionalServiceRoutes');
const shopGalleryRoutes = require('./routes/shopGalleryRoutes');
const addressRoutes = require('./routes/addressRoutes');
const companyRoutes = require('./routes/companyRoutes');
const myVehicleRoutes = require('./routes/myVehicleRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const subMechanicRoutes = require('./routes/subMechanicRoutes');
const serviceWithPriceRoutes = require('./routes/serviceWithPriceRoutes');
const productRoutes = require('./routes/productRoutes');
const productLogRoutes = require('./routes/productLogRoutes');
const serviceReminderRoutes = require('./routes/serviceReminderRoutes');
const walletRoutes = require('./routes/walletRoutes');

router.use("/user", userRoutes)
router.use("/vendor", vendorRoutes)
router.use("/admin", adminRoutes)
router.use("/shopService", shopServiceRoutes)
router.use("/emergencyService", emergencyServiceRoutes)
router.use("/garageDetails", garageRoutes)
router.use("/serviceRateDetails", serviceRateRoute)
router.use("/additionalServiceDetails", additionalServiceRoutes)
router.use("/shopGallery", shopGalleryRoutes)
router.use("/address", addressRoutes)
router.use("/company", companyRoutes)
router.use("/myVehicle", myVehicleRoutes)
router.use("/booking", bookingRoutes)
router.use("/subMechanic", subMechanicRoutes)
router.use("/service/price", serviceWithPriceRoutes)
router.use("/product", productRoutes)
router.use("/productHistory", productLogRoutes)
router.use("/serviceReminder", serviceReminderRoutes)
router.use("/wallet", walletRoutes)

module.exports = router;
