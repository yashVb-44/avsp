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
const gstRoutes = require('./routes/gstRoutes');
const unitTypeRoutes = require('./routes/unitTypeRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const myVehicleRoutes = require('./routes/myVehicleRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const subMechanicRoutes = require('./routes/subMechanicRoutes');
const serviceWithPriceRoutes = require('./routes/serviceWithPriceRoutes');
const productRoutes = require('./routes/productRoutes');
const productLogRoutes = require('./routes/productLogRoutes');
const serviceReminderRoutes = require('./routes/serviceReminderRoutes');
const walletRoutes = require('./routes/walletRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const saleInvoiceRoutes = require('./routes/saleInvoiceRoutes');
const purchaseInvoiceRoutes = require('./routes/purchaseInvoiceRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const expenseCategoryRoutes = require('./routes/expenseCategoryRoutes');
const settingRoutes = require('./routes/settingRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const contactUsRoutes = require('./routes/contactUsRoutes');
const subscriptionPlanRoutes = require('./routes/subscriptionPlanRoutes');
const bannerRoutes = require('./routes/bannerRoutes');

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
router.use("/category", categoryRoutes)
router.use("/gst", gstRoutes)
router.use("/unitType", unitTypeRoutes)
router.use("/myVehicle", myVehicleRoutes)
router.use("/booking", bookingRoutes)
router.use("/subMechanic", subMechanicRoutes)
router.use("/service/price", serviceWithPriceRoutes)
router.use("/product", productRoutes)
router.use("/productHistory", productLogRoutes)
router.use("/serviceReminder", serviceReminderRoutes)
router.use("/wallet", walletRoutes)
router.use("/transaction", transactionRoutes)
router.use("/sale/invoice", saleInvoiceRoutes)
router.use("/purchase/invoice", purchaseInvoiceRoutes)
router.use("/expense", expenseRoutes)
router.use("/expense/category", expenseCategoryRoutes)
router.use("/settings", settingRoutes)
router.use("/invoice", invoiceRoutes)
router.use("/contactUs", contactUsRoutes)
router.use("/subscription/plan", subscriptionPlanRoutes)
router.use("/banner", bannerRoutes)

module.exports = router;
