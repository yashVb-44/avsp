const upload = require('../config/mutler');
const Booking = require('../models/booking'); // Adjust the path as necessary
const asyncHandler = require('express-async-handler');
const removeUnwantedImages = require('../utils/deletingFiles');
const { ganerateOneLineImageUrls } = require('../utils/utils');
const ServiceWithPrice = require('../models/serviceWithPrice');
const ShopService = require('../models/shopService');
const Product = require('../models/product');
const { addRemoveAmountFromWallet } = require('../utils/wallet');
const { addUserWallet } = require('./walletController');
const { addTransaction } = require('../utils/transaction');
const { generateInvoiceCode } = require('../utils/invoice');
// const MyVehicle = require('../models/MyVehicle');
// const Vendor = require('../models/Vendor');
// const User = require('../models/User');

const addBooking = async (req, res) => {
    try {
        const user = req.user;
        const { vendor, myVehicle, services, scheduleDate, scheduleTime, pickupAddress, dropAddress, pickupTimeSlot, dropTimeSlot, serviceType, garage, addNewServiceDate,
            cancelledByUserDate, cancelledByVendorDate, acceptedDate, declinedDate, collectedByGarageDate, pendingDate, workProgressDate, completedDate, recivedByUserDate, otherService } = req.body;

        // Validate serviceType
        const validServiceTypes = ['1', '2', '3', '4'];
        if (!validServiceTypes.includes(serviceType)) {
            return res.status(400).json({ message: "Invalid service type" });
        }

        const invoice = await generateInvoiceCode({ type: "0", fromVendorId: vendor, toId: user.id, toModel: "User" })

        // Initialize booking data
        let bookingData = {
            invoice: invoice?._id,
            user: user.id,
            vendor,
            myVehicle,
            services,
            scheduleDate,
            scheduleTime,
            bookingID: generateBookingID(), // You can implement a function to generate unique booking IDs
            serviceType,
            garage,
            status: "1", // change this field
            addNewServiceDate,
            acceptedDate,
            collectedByGarageDate,
            pendingDate,
            workProgressDate,
            cancelledByVendorDate,
            cancelledByUserDate,
            completedDate,
            recivedByUserDate,
            declinedDate,
            otherService
        };

        // Handle address based on serviceType
        if (serviceType === '2') { // Pickup only
            bookingData.pickupAddress = pickupAddress;
            bookingData.pickupTimeSlot = pickupTimeSlot;
        } else if (serviceType === '3') { // Drop only
            bookingData.dropAddress = dropAddress;
            bookingData.dropTimeSlot = dropTimeSlot;
        } else if (serviceType === '4') { // Both pickup and drop
            bookingData.pickupAddress = pickupAddress;
            bookingData.dropAddress = dropAddress;
            bookingData.pickupTimeSlot = pickupTimeSlot;
            bookingData.dropTimeSlot = dropTimeSlot;
        }


        // Map services and fetch corresponding prices and names
        const serviceWithPrices = await Promise.all(services.map(async (serviceId) => {
            const servicePrice = await ServiceWithPrice.findOne({
                shopService: serviceId,
                vendor: vendor
            }).populate('shopService');

            if (servicePrice) {
                return {
                    serviceId: servicePrice.shopService._id,
                    serviceName: servicePrice.shopService.name,
                    price: servicePrice.price,
                    labourCharges: 0
                };
            } else {
                // If service price not found, fallback to 0 price or handle this case as needed
                const serviceDetails = await ShopService.findById(serviceId);
                return {
                    serviceId: serviceDetails._id,
                    serviceName: serviceDetails.name,
                    price: 0,
                    labourCharges: 0
                };
            }
        }));

        bookingData.serviceWithPrice = serviceWithPrices;
        // Create booking
        const newBooking = new Booking(bookingData);
        await newBooking.save();

        return res.status(201).json({
            message: "Booking created successfully",
            booking: newBooking
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

const getBookingList = async (req, res) => {
    try {
        const { id, role } = req.user;

        let filter = {};

        // Determine filter based on role
        if (role === 'user') {
            filter.user = id; // If the role is user, filter by user ID
        } else if (role === 'vendor') {
            filter.vendor = id; // If the role is vendor, filter by vendor ID
        } else if (role === 'admin') {
            filter = {}
        } else {
            return res.status(403).json({ message: "Unauthorized access" });
        }

        // Fetch bookings based on the filter
        const bookings = await Booking.find(filter).sort({ createdAt: -1 })
            .populate('user', 'name email') // Populate user details (customize as needed)
            .populate('vendor', 'name serviceType mobileNo') // Populate vendor details (customize as needed)
            .populate('myVehicle', 'brand model number') // Populate vehicle details (customize as needed)
            .populate('services', 'name serviceType') // Populate service details (customize as needed)
            .populate('pickupAddress', 'address') // Populate pickup address details
            .populate('dropAddress', 'address') // Populate drop address details
            .populate('garage', 'name address')
            .sort({ createdAt: -1 }); // Sort by creation date, newest first

        return res.status(200).json({
            type: 'success',
            message: "Booking list retrieved successfully",
            bookings
        });
    } catch (error) {
        return res.status(500).json({
            type: "error",
            message: "Internal server error",
            error: error.message
        });
    }
};

const getBookingDetails = async (req, res) => {
    try {
        const { id, role } = req.user; // Get user id and role from authentication middleware
        const { bookingId } = req.params; // Get bookingId from request parameters

        let filter = { _id: bookingId }; // Base filter to find the booking by ID

        // Determine additional filter conditions based on role
        if (role === 'user') {
            filter.user = id; // If the role is user, ensure the booking belongs to the user
        } else if (role === 'vendor') {
            filter.vendor = id; // If the role is vendor, ensure the booking belongs to the vendor
        } else if (role === 'admin') {
            // Admin has access to any booking, no need to modify the filter
        } else {
            return res.status(403).json({ message: "Unauthorized access" });
        }

        // Fetch the booking with all relevant details
        let booking = await Booking.findOne(filter)
            .populate('user') // Populate user details
            .populate('vendor') // Populate vendor details
            .populate('myVehicle') // Populate vehicle details
            .populate('services') // Populate service details
            .populate('pickupAddress') // Populate pickup address details
            .populate('dropAddress') // Populate drop address details
            .populate('garage')

        // Check if booking exists
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        booking = {
            ...booking.toObject(),
            dentImage: ganerateOneLineImageUrls(booking.dentImage, req),
            afterServiceImage: ganerateOneLineImageUrls(booking.afterServiceImage, req),
            beforeServiceImage: ganerateOneLineImageUrls(booking.beforeServiceImage, req),
            myVehicle: {
                ...booking.myVehicle.toObject(),
                image: ganerateOneLineImageUrls(booking.myVehicle.image, req)
            },
            user: {
                ...booking.user.toObject(),
                image: ganerateOneLineImageUrls(booking.user.profileImage, req)
            }
        }

        return res.status(200).json({
            type: 'success',
            message: "Booking details retrieved successfully",
            booking
        });
    } catch (error) {
        return res.status(500).json({
            type: "error",
            message: "Internal server error",
            error: error.message
        });
    }
};

const cancelBooking = async (req, res) => {
    try {
        const { id } = req.user;
        const { bookingId } = req.params;
        const { cancellationReason } = req.body;

        // Validate cancellation reason
        if (!cancellationReason || cancellationReason.trim() === "") {
            return res.status(400).json({ type: "error", message: "Cancellation reason is required" });
        }

        // Find the booking that belongs to the user
        const booking = await Booking.findOne({ _id: bookingId, user: id });

        // If booking not found or already cancelled
        if (!booking) {
            return res.status(404).json({ type: "error", message: "Booking not found" });
        }

        if (booking.status === '9') {
            return res.status(400).json({ type: "error", message: "Booking is already cancelled" });
        }

        // Update booking status and add cancellation reason
        booking.status = '9';
        booking.reason = cancellationReason;

        await booking.save(); // Save the updated booking

        return res.status(200).json({
            type: 'success',
            message: "Booking cancelled successfully",
            booking
        });
    } catch (error) {
        return res.status(500).json({
            type: "error",
            message: "Internal server error",
            error: error.message
        });
    }
};

const getBookingListOfVendor = async (req, res) => {
    try {
        const { id, role } = req.user;
        const { status } = req.body

        let filter = {};

        if (role === 'vendor') {
            filter.vendor = id;
            filter.status = status
        } else {
            return res.status(403).json({ message: "Unauthorized access" });
        }

        // Fetch bookings based on the filter
        const bookings = await Booking.find(filter).sort({ createdAt: -1 })
            .populate('user', 'name email') // Populate user details (customize as needed)
            .populate('garage', 'name address')
            // .populate('vendor', 'name serviceType mobileNo') // Populate vendor details (customize as needed)
            .populate('myVehicle', 'brand model number') // Populate vehicle details (customize as needed)
            // .populate('services', 'name serviceType') // Populate service details (customize as needed)
            // .populate('pickupAddress', 'address') // Populate pickup address details
            // .populate('dropAddress', 'address') // Populate drop address details
            .sort({ createdAt: -1 }); // Sort by creation date, newest first

        return res.status(200).json({
            type: 'success',
            message: "Booking list retrieved successfully",
            bookings
        });
    } catch (error) {
        return res.status(500).json({
            type: "error",
            message: "Internal server error",
            error: error.message
        });
    }
};

const declineBooking = async (req, res) => {
    try {
        const { id } = req.user;
        const { bookingId } = req.params;
        const { declineReason } = req.body;

        // Validate cancellation reason
        if (!declineReason || declineReason.trim() === "") {
            return res.status(400).json({ type: "error", message: "Decline reason is required" });
        }

        // Find the booking that belongs to the user
        const booking = await Booking.findOne({ _id: bookingId, vendor: id });

        // If booking not found or already cancelled
        if (!booking) {
            return res.status(404).json({ type: "error", message: "Booking not found" });
        }

        if (booking.status === '5') {
            return res.status(400).json({ type: "error", message: "Booking is already declined" });
        }

        // Update booking status and add cancellation reason
        booking.status = '5';
        booking.reason = declineReason;

        await booking.save(); // Save the updated booking

        return res.status(200).json({
            type: 'success',
            message: "Booking declined successfully",
            booking
        });
    } catch (error) {
        return res.status(500).json({
            type: "error",
            message: "Internal server error",
            error: error.message
        });
    }
};

const uploadImage = [
    upload.fields([
        { name: 'dentImage', maxCount: 1 },
        { name: 'afterServiceImage', maxCount: 1 },
        { name: 'beforeServiceImage', maxCount: 1 },
    ]),
    asyncHandler(async (req, res) => {
        try {
            const { id } = req.params;
            const user = req.user;

            let booking = await Booking.findById(id).populate('vendor');

            if (!booking) {
                removeUnwantedImages(Object.values(req.files).flat().map(file => file.path));
                return res.status(404).json({
                    message: 'Booking not found',
                    type: 'error',
                });
            }

            // Allow updates the vendor who created the booking
            if ((user.role === 'vendor' && booking.vendor.equals(user.id))) {
                const oldImages = [];
                if (req.files.dentImage) {
                    oldImages.push(booking.dentImage);
                    booking.dentImage = req.files.dentImage[0].path;
                }
                if (req.files.beforeServiceImage) {
                    oldImages.push(booking.beforeServiceImage);
                    booking.beforeServiceImage = req.files.beforeServiceImage[0].path;
                }
                if (req.files.afterServiceImage) {
                    oldImages.push(booking.afterServiceImage);
                    booking.afterServiceImage = req.files.afterServiceImage[0].path;
                }

                await booking.save();
                removeUnwantedImages(oldImages);
                return res.status(200).json({
                    message: 'Booking updated successfully',
                    type: 'success',
                    booking,
                });
            } else {
                removeUnwantedImages(Object.values(req.files).flat().map(file => file.path));
                return res.status(403).json({
                    message: 'Forbidden',
                    type: 'error',
                });
            }
        } catch (error) {
            console.log(error)
            removeUnwantedImages(Object.values(req.files).flat().map(file => file.path));
            return res.status(500).json({
                message: 'Failed to update booking',
                error: error.message,
                type: 'error',
            });
        }
    }),
];

const updateBooking = async (req, res) => {
    try {
        const vendor = req.user;
        const { id } = req.params;
        const updates = req.body;

        // Find the booking by ID
        let booking = await Booking.findOne({ _id: id, vendor: vendor.id });

        if (!booking) {
            return res.status(404).json({
                message: "Booking not found",
                type: "error",
            });
        }

        // If 'services' field is being updated
        if (updates.services) {
            const { services } = updates;

            // Get the existing service IDs from the current booking
            const existingServiceIds = booking.services.map(service => service.toString());

            // Find new services that are not already in the booking
            const newServices = services.filter(serviceId => !existingServiceIds.includes(serviceId));

            // Map new services and fetch corresponding prices and names
            const newServiceWithPrices = await Promise.all(newServices.map(async (serviceId) => {
                const servicePrice = await ServiceWithPrice.findOne({
                    shopService: serviceId,
                    vendor: vendor.id || booking.vendor
                }).populate('shopService');

                if (servicePrice) {
                    return {
                        serviceId: servicePrice.shopService._id,
                        serviceName: servicePrice.shopService.name,
                        price: servicePrice.price
                    };
                } else {
                    const serviceDetails = await ShopService.findById(serviceId);
                    return {
                        serviceId: serviceDetails._id,
                        serviceName: serviceDetails.name,
                        price: 0
                    };
                }
            }));

            // Preserve existing services' prices and add new ones
            updates.serviceWithPrice = [
                ...booking.serviceWithPrice,  // Keep the existing services and their prices
                ...newServiceWithPrices       // Add the new services with their prices
            ];

            // Update the 'services' field with the complete list of services
            updates.services = [...existingServiceIds, ...newServices];
        }

        if (updates.collectedOption) {
            updates.collectedOption === "0" ? booking.collectedByModel = "Vendor" : booking.collectedByModel = "SubMechanic"
        }

        // Update only the provided fields
        Object.assign(booking, updates);
        if (updates.status === "6") {
            await addRemoveAmountFromWallet({ ownerType: "0", ownerId: booking.user, amount: booking.payableAmount, amountType: "0", vendor: vendor.id })
            await addTransaction({ ownerType: "0", ownerId: booking.user, booking: booking, amountType: "0", vendor: vendor.id, transactionType: "0" })
            booking.remainingAmount = booking.payableAmount
        }
        // Save the updated booking
        await booking.save();

        return res.status(200).json({
            message: "Booking updated successfully",
            type: "success",
            booking
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

const removeServiceFromBooking = async (req, res) => {
    try {
        const vendor = req.user;
        const { id } = req.params;
        const { serviceId } = req.body;

        // Find the booking by ID
        let booking = await Booking.findOne({ _id: id, vendor: vendor.id });

        if (!booking) {
            return res.status(404).json({
                message: "Booking not found",
                type: "error",
            });
        }

        const newServicesArray = booking.services.filter((service) => service.toString() !== serviceId)
        const newServicesPriceArray = booking.serviceWithPrice.filter((servicePrice) => servicePrice.serviceId.toString() !== serviceId)

        booking.services = newServicesArray
        booking.serviceWithPrice = newServicesPriceArray

        await booking.save();

        return res.status(200).json({
            message: "Service deleted successfully",
            type: "success",
            booking
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

// Function to generate a unique booking ID
const generateBookingID = () => {
    return `BOOK-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
};

module.exports = { addBooking, getBookingList, getBookingDetails, cancelBooking, getBookingListOfVendor, declineBooking, uploadImage, updateBooking, removeServiceFromBooking };
