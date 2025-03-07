const asyncHandler = require('express-async-handler');
const Vendor = require('../models/vendor');
const Garage = require('../models/garage');
const upload = require('../config/mutler');
const geolib = require('geolib');
const { default: mongoose } = require('mongoose');
const { convertToAmPm, generateImageUrls, ganerateOneLineImageUrls, getDayName } = require('../utils/utils');
const ShopGallery = require('../models/shopGallery');
const AdditionalService = require('../models/additionalService');
const EmeregencyService = require('../models/emeregencyService');
const ServiceRate = require('../models/serviceRate');
const { getVendorRatings } = require('../utils/rating');
const SubscriptionHistory = require('../models/subscriptionHistory');


// Get Vendor Profile
const getVendorProfile = asyncHandler(async (req, res) => {
    try {
        const vendorId = req.params.id || req.user.id;

        // Check if the user is an admin or the vendor
        if (req.user.role !== 'admin' && req.user.id !== vendorId) {
            return res.status(403).json({
                message: 'Forbidden',
                type: 'error',
            });
        }

        const vendor = await Vendor.findById(vendorId);

        if (!vendor) {
            return res.status(404).json({
                message: 'Vendor not found',
                type: 'error',
            });
        }

        // Generate profile image URL
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        if (vendor.profileImage) {
            vendor.profileImage = `${baseUrl}/${vendor.profileImage}`;
        }

        return res.status(200).json({
            vendor,
            type: 'success',
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to retrieve vendor profile',
            error: error.message,
            type: 'error',
        });
    }
});

// Update Vendor Profile
const updateVendorProfile = [
    upload.single('profileImage'),
    asyncHandler(async (req, res) => {
        try {
            const vendorId = req.params.id || req.user.id;

            // Check if the user is an admin or the vendor
            if (req.user.role !== 'admin' && req.user.id !== vendorId) {
                return res.status(403).json({
                    message: 'Forbidden',
                    type: 'error',
                });
            }

            const vendor = await Vendor.findById(vendorId);

            if (!vendor) {
                return res.status(404).json({
                    message: 'Vendor not found',
                    type: 'error',
                });
            }

            // Update fields
            const { name, mobileNo, email, gender, dateOfBirth, serviceType } = req.body;

            if (name) vendor.name = name;
            if (mobileNo) vendor.mobileNo = mobileNo;
            if (email) vendor.email = email;
            if (gender) vendor.gender = gender;
            if (dateOfBirth) vendor.dateOfBirth = dateOfBirth;
            if (serviceType) vendor.serviceType = serviceType;

            if (req.user.role === 'admin') {
                Object.assign(vendor, req.body);
            }

            // Update profile image if provided
            if (req.file) {
                vendor.profileImage = req.file.path;
            }

            await vendor.save();

            return res.status(200).json({
                message: 'Vendor profile updated successfully',
                type: 'success',
                vendor,
            });
        } catch (error) {
            return res.status(500).json({
                message: 'Failed to update vendor profile',
                error: error.message,
                type: 'error',
            });
        }
    }),
];

// vendor list after filteration
// const filterVendors = asyncHandler(async (req, res) => {
//     try {
//         const { radius, mechType, serviceTypes, lat, lng, dateTime } = req.body;

//         // Ensure necessary parameters are provided
//         if (!radius || !mechType || !serviceTypes || !lat || !lng || !dateTime) {
//             return res.status(400).json({
//                 message: 'Please provide all required filters: radius, mechType, serviceTypes, lat, lng, dateTime',
//                 type: 'error',
//             });
//         }

//         // Convert serviceTypes from array of strings to ObjectIds if needed
//         const serviceObjectIds = serviceTypes.map(id => new mongoose.Types.ObjectId(id));

//         // Parse dateTime from the body
//         const requestedDateTime = new Date(dateTime);
//         const requestedDay = requestedDateTime.getDay();
//         const requestedTime = requestedDateTime.getHours() + (requestedDateTime.getMinutes() / 60);

//         // Find all garages and their corresponding vendors
//         const garages = await Garage.find().populate('vendor');

//         // Filter garages based on distance, mechType, serviceTypes, and timings
//         const filteredGarages = garages.filter(garage => {
//             // Calculate the distance between user's location and garage location
//             const distance = geolib.getDistance(
//                 { latitude: lat, longitude: lng },
//                 { latitude: garage.lat, longitude: garage.lng }
//             );

//             // Convert distance to kilometers and check if it's within the radius
//             const distanceInKm = distance / 1000;
//             const isWithinRadius = distanceInKm <= radius;

//             // Check if vendor's serviceType matches the provided mechType
//             const isMechTypeMatching = garage.vendor.serviceType === mechType;

//             // Check if garage has any service that matches the provided serviceTypes
//             const hasMatchingService = garage.shopService.some(service =>
//                 serviceObjectIds.some(serviceObjectId => service.equals(serviceObjectId))
//             );

//             // Check if the garage is open or closed based on the weeklyTimings
//             const todayTimings = garage.weeklyTimings[requestedDay]; // Assuming weeklyTimings is an array of objects

//             // Return true if all conditions are met
//             return isWithinRadius && isMechTypeMatching && hasMatchingService && todayTimings;
//         });

//         // If no garages match the criteria
//         if (filteredGarages.length === 0) {
//             return res.status(404).json({
//                 message: 'No vendors found matching the criteria',
//                 type: 'error',
//             });
//         }

//         // Map filtered garages to include additional information about open/close status, distance, and outsideImage
//         const response = await Promise.all(filteredGarages.map(async garage => {
//             const distanceInKm = geolib.getDistance(
//                 { latitude: lat, longitude: lng },
//                 { latitude: garage.lat, longitude: garage.lng }
//             ) / 1000;

//             const todayTimings = garage.weeklyTimings[requestedDay];
//             const isOpen = todayTimings.isAvailable && todayTimings && requestedTime >= todayTimings.startTime && todayTimings.endTime;

//             // Convert startTime and endTime to AM/PM format
//             const startTimeFormatted = convertToAmPm(todayTimings.startTime);
//             const endTimeFormatted = convertToAmPm(todayTimings.endTime);

//             const status = isOpen
//                 ? { status: 'Open', message: `Close ${endTimeFormatted}` }
//                 : { status: 'Closed', message: `Open ${startTimeFormatted}` };

//             // Fetch the outsideImage from the ShopGallery model
//             const shopGallery = await ShopGallery.findOne({ vendor: garage.vendor._id }).select('outsideImage');
//             let Image = shopGallery ? shopGallery.outsideImage : null;
//             Image = ganerateOneLineImageUrls(Image, req)

//             return {
//                 garage: garage,
//                 distanceInKm,
//                 status,
//                 Image,
//             };
//         }));

//         // Return the filtered garages with additional information
//         return res.status(200).json({
//             vendors: response,
//             type: 'success',
//         });
//     } catch (error) {
//         return res.status(500).json({
//             message: 'Failed to filter vendors',
//             error: error.message,
//             type: 'error',
//         });
//     }
// });

// const filterVendors = asyncHandler(async (req, res) => {
//     try {
//         const { radius, mechType, serviceTypes, lat, lng, dateTime, page = 1, limit = 10 } = req.body;

//         // Ensure necessary parameters are provided
//         if (!radius || !mechType || !lat || !lng || !dateTime) {
//             return res.status(400).json({
//                 message: 'Please provide all required filters: radius, mechType, lat, lng, dateTime',
//                 type: 'error',
//             });
//         }

//         // Convert serviceTypes from array of strings to ObjectIds if needed
//         let serviceObjectIds = [];
//         if (serviceTypes && serviceTypes.length > 0) {
//             serviceObjectIds = serviceTypes.map(id => new mongoose.Types.ObjectId(id));
//         }

//         // Parse dateTime from the body
//         const requestedDateTime = new Date(dateTime);
//         const requestedDay = requestedDateTime.getDay();
//         const requestedTime = requestedDateTime.getHours() + (requestedDateTime.getMinutes() / 60);

//         // Find all garages and their corresponding vendors
//         const garages = await Garage.find().populate('vendor');

//         // Filter garages based on distance, mechType, serviceTypes, and timings
//         const filteredGarages = garages.filter(garage => {
//             // Calculate the distance between user's location and garage location
//             const distance = geolib.getDistance(
//                 { latitude: lat, longitude: lng },
//                 { latitude: garage.lat, longitude: garage.lng }
//             );

//             // Convert distance to kilometers and check if it's within the radius
//             const distanceInKm = distance / 1000;
//             const isWithinRadius = distanceInKm <= radius;

//             // Check if vendor's serviceType matches the provided mechType
//             const isMechTypeMatching = garage.vendor.serviceType === mechType;

//             // Check if garage has any service that matches the provided serviceTypes
//             const hasMatchingService = serviceObjectIds.length === 0 || // If serviceTypes is empty, skip this check
//                 garage.shopService.some(service =>
//                     serviceObjectIds.some(serviceObjectId => service.equals(serviceObjectId))
//                 );

//             // Check if the garage is open or closed based on the weeklyTimings
//             const todayTimings = garage.weeklyTimings[requestedDay]; // Assuming weeklyTimings is an array of objects

//             // Return true if all conditions are met
//             return isWithinRadius && isMechTypeMatching && hasMatchingService && todayTimings;
//         });

//         // If no garages match the criteria
//         if (filteredGarages.length === 0) {
//             return res.status(404).json({
//                 message: 'No vendors found matching the criteria',
//                 type: 'error',
//             });
//         }

//         // Pagination calculation
//         const startIndex = (page - 1) * limit;
//         const endIndex = startIndex + limit;
//         const paginatedGarages = filteredGarages.slice(startIndex, endIndex);

//         // Map paginated garages to include additional information about open/close status, distance, and outsideImage
//         const response = await Promise.all(paginatedGarages.map(async garage => {
//             const distanceInKm = geolib.getDistance(
//                 { latitude: lat, longitude: lng },
//                 { latitude: garage.lat, longitude: garage.lng }
//             ) / 1000;

//             const todayTimings = garage.weeklyTimings[requestedDay];
//             const isOpen = todayTimings.isAvailable && todayTimings && requestedTime >= todayTimings.startTime && requestedTime <= todayTimings.endTime;

//             // Convert startTime and endTime to AM/PM format
//             const startTimeFormatted = convertToAmPm(todayTimings?.startTime);
//             const endTimeFormatted = convertToAmPm(todayTimings?.endTime);

//             const status = isOpen
//                 ? { status: 'Open', message: `Close ${endTimeFormatted}` }
//                 : { status: 'Closed', message: `Open ${startTimeFormatted}` };

//             // Fetch the outsideImage from the ShopGallery model
//             const shopGallery = await ShopGallery.findOne({ vendor: garage.vendor._id }).select('outsideImage');
//             let Image = shopGallery ? shopGallery.outsideImage : null;
//             Image = ganerateOneLineImageUrls(Image, req);

//             return {
//                 garage: garage,
//                 distanceInKm,
//                 status,
//                 Image,
//             };
//         }));

//         // Return the paginated garages with additional information
//         return res.status(200).json({
//             vendors: response,
//             currentPage: page,
//             totalPages: Math.ceil(filteredGarages.length / limit),
//             totalVendors: filteredGarages.length,
//             type: 'success',
//         });
//     } catch (error) {
//         console.log(error)
//         return res.status(500).json({
//             message: 'Failed to filter vendors',
//             error: error.message,
//             type: 'error',
//         });
//     }
// });

const filterVendors = asyncHandler(async (req, res) => {
    try {
        let { radius, mechType, serviceTypes, lat, lng, dateTime, page = 1, limit = 10, search } = req.body;
        // Ensure necessary parameters are provided
        if (!radius || !mechType || !lat || !lng || !dateTime) {
            return res.status(400).json({
                message: 'Please provide all required filters: radius, mechType, lat, lng, dateTime',
                type: 'error',
            });
        }

        // Convert serviceTypes from array of strings to ObjectIds if needed
        let serviceObjectIds = [];
        if (serviceTypes && serviceTypes.length > 0) {
            serviceObjectIds = serviceTypes.map(id => new mongoose.Types.ObjectId(id));
        }

        // Parse dateTime from the body
        const requestedDateTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
        const istDate = new Date(requestedDateTime)
        let requestedDay = istDate.toLocaleString('en-US', { weekday: 'long' });
        const requestedTime = istDate.getHours() + (istDate.getMinutes() / 60)

        // Find all garages and their corresponding vendors
        const garages = await Garage.find().populate('vendor');
        // Filter garages based on distance, mechType, serviceTypes, and timings
        const filteredGarages = garages?.filter(garage => {
            // Calculate the distance between user's location and garage location
            let distance = geolib?.getDistance(
                { latitude: lat, longitude: lng },
                { latitude: garage.lat || 21.1835897, longitude: garage.lng || 72.783059 }
            );

            // Convert distance to kilometers and check if it's within the radius
            const distanceInKm = distance / 1000;
            const isWithinRadius = distanceInKm <= radius;

            // Check if vendor's serviceType matches the provided mechType
            const isMechTypeMatching = garage.vendor.serviceType === mechType;

            // Check if garage has any service that matches the provided serviceTypes
            const hasMatchingService = serviceObjectIds.length === 0 || // If serviceTypes is empty, skip this check
                garage.shopService.some(service =>
                    serviceObjectIds.some(serviceObjectId => service.equals(serviceObjectId))
                );

            // Check if the garage is open based on the weeklyTimings
            const todayTimings = garage.weeklyTimings.find(t => t.day === requestedDay);
            // Check if the search term matches the garage name (case-insensitive)
            const matchesSearch = search
                ? garage.name.toLowerCase().includes(search.toLowerCase())
                : true;
            // Return true if all conditions are met
            return isWithinRadius && isMechTypeMatching && hasMatchingService && todayTimings && matchesSearch;
        });

        // If no garages match the criteria
        if (filteredGarages.length === 0) {
            return res.status(404).json({
                message: 'No vendors found matching the criteria',
                type: 'error',
            });
        }

        // Pagination calculation
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedGarages = filteredGarages.slice(startIndex, endIndex);

        // Map paginated garages to include additional information about open/close status, distance, and outsideImage
        const response = await Promise.all(paginatedGarages.map(async garage => {
            const distanceInKm = geolib.getDistance(
                { latitude: lat, longitude: lng },
                { latitude: garage.lat || 21.1835897, longitude: garage.lng || 72.783059 }
            ) / 1000;

            const todayTimings = garage.weeklyTimings.find(t => t.day === requestedDay);
            let isOpen = false, nextOpeningTime = null, closingTime = null;

            const convertTimeToDecimal = (timeStr) => {
                if (timeStr) {
                    const [hours, minutes] = timeStr?.split(":")?.map(Number);
                    return hours + minutes / 60;
                } else {
                    return ""
                }
            };

            // Convert DB startTime and endTime
            const startTimeDecimal = convertTimeToDecimal(todayTimings.startTime);
            const endTimeDecimal = convertTimeToDecimal(todayTimings.endTime);

            if (todayTimings && todayTimings.isAvailable) {
                if (requestedTime >= startTimeDecimal && requestedTime <= endTimeDecimal) {
                    isOpen = true;
                    closingTime = todayTimings.endTime;
                } else if (requestedTime < startTimeDecimal) {
                    nextOpeningTime = todayTimings?.startTime;
                }
            }

            const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
            const requestedDayIndex = daysOfWeek.indexOf(requestedDay);
            let nextAvailableDay = requestedDay;
            if (!isOpen && !nextOpeningTime) {
                for (let i = 1; i <= 7; i++) {
                    nextAvailableDay = (requestedDayIndex + i) % 7;
                    const nextTimings = garage.weeklyTimings[nextAvailableDay];
                    if (nextTimings && nextTimings.isAvailable) {
                        nextOpeningTime = nextTimings.startTime;
                        break;
                    }
                }
            }

            const status = isOpen
                ? { status: 'Open', message: `Closes at ${convertToAmPm(closingTime)}` }
                : { status: 'Closed', message: `Opens at ${convertToAmPm(nextOpeningTime)} on ${getDayName(nextAvailableDay)}` };

            const shopGallery = await ShopGallery.findOne({ vendor: garage.vendor._id }).select('outsideImage');
            let Image = shopGallery ? shopGallery.outsideImage : null;
            Image = ganerateOneLineImageUrls(Image, req);
            const ratings = await getVendorRatings({ vendorId: garage.vendor._id });

            return {
                garage: garage,
                distanceInKm,
                status,
                Image,
                ratings
            };
        }));

        // Return the paginated garages with additional information
        return res.status(200).json({
            vendors: response,
            currentPage: page,
            totalPages: Math.ceil(filteredGarages.length / limit),
            totalVendors: filteredGarages.length,
            type: 'success',
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Failed to filter vendors',
            error: error.message,
            type: 'error',
        });
    }
});

// single vendor details
const vendorDetails = asyncHandler(async (req, res) => {
    try {
        const { vendorId, lat, lng, dateTime } = req.body;

        // Ensure necessary parameters are provided
        if (!vendorId || !lat || !lng || !dateTime) {
            return res.status(400).json({
                message: 'Please provide all required filters: vendorId, lat, lng, dateTime',
                type: 'error',
            });
        }

        // Parse dateTime from the body
        const requestedDateTime = new Date(dateTime);
        const requestedDay = requestedDateTime.getDay();
        const requestedTime = requestedDateTime.getHours() + (requestedDateTime.getMinutes() / 60);

        // Find the garage for the vendor and populate relevant data
        const garage = await Garage.findOne({ vendor: vendorId })
            .populate('shopService') // Populate shop services
            .populate({
                path: 'vendor',
            })
            .lean();

        const additionalService = await AdditionalService.findOne({ vendor: vendorId }).lean();
        const emergencyService = await ServiceRate.findOne({ vendor: vendorId }).lean();

        if (!garage) {
            return res.status(404).json({
                message: 'Vendor not found',
                type: 'error',
            });
        }

        // Fetch gallery images
        const shopGallery = await ShopGallery.findOne({ vendor: vendorId }).lean();

        // Calculate distance between user's location and garage location
        const distance = geolib.getDistance(
            { latitude: lat, longitude: lng },
            { latitude: garage.lat, longitude: garage.lng }
        );
        const distanceInKm = distance / 1000;

        // Check if the garage is open or closed based on the weeklyTimings
        const todayTimings = garage.weeklyTimings[requestedDay];
        const isOpen = todayTimings.isAvailable && requestedTime >= todayTimings.startTime && requestedTime < todayTimings.endTime;

        // Convert startTime and endTime to AM/PM format
        const startTimeFormatted = convertToAmPm(todayTimings.startTime);
        const endTimeFormatted = convertToAmPm(todayTimings.endTime);

        const status = isOpen
            ? { status: 'Open', message: `Close ${endTimeFormatted}` }
            : { status: 'Closed', message: `Open ${startTimeFormatted}` };

        const ratings = await getVendorRatings({ vendorId: garage.vendor._id });

        // Prepare the response object
        const response = {
            basicDetails: {
                shopGallery: shopGallery ? {
                    ownerImage: ganerateOneLineImageUrls(shopGallery.ownerImage, req),
                    vehicleRepairImage: ganerateOneLineImageUrls(shopGallery.vehicleRepairImage, req),
                    insideImage: ganerateOneLineImageUrls(shopGallery.insideImage, req),
                    outsideImage: ganerateOneLineImageUrls(shopGallery.outsideImage, req),
                } : {},
                garageName: garage.name,
                status,
                distanceInKm,
            },
            details: {
                vendorName: garage.vendor.name,
                mobileNo: garage.vendor.mobile,
                yearsOfGarage: garage.yearsOfGarage,
                vehicleTypeHandle: garage.vehicalTypeHandle,
                address: garage.address,
                lat: garage.lat,
                lng: garage.lng,
                timeSchedule: garage.weeklyTimings,
                privacyPolicy: garage.privacyPolicy,
            },
            services: {
                shopServices: garage.shopService,
                additionalServices: additionalService,
                emergencyService: emergencyService,
            },
            ratings
        };

        // Return the vendor details
        return res.status(200).json({
            vendor: response,
            type: 'success',
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to get vendor details',
            error: error.message,
            type: 'error',
        });
    }
});

const getVendorsForAdmin = async (req, res) => {
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
                    { email: regex },
                    { mobileNo: regex }
                ]
            };
        }

        const totalVendors = await Vendor.countDocuments(searchQuery);

        let vendors = await Vendor.find(searchQuery)
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)
            .sort({ createdAt: -1 }); // Sort by creation date, newest first

        vendors = vendors.map((vendor) => {
            let serviceTypeName = "";
            if (vendor.serviceType === "1") {
                serviceTypeName = "2 wheeler";
            } else if (vendor.serviceType === "2") {
                serviceTypeName = "3 wheeler";
            } else if (vendor.serviceType === "3") {
                serviceTypeName = "4 wheeler";
            } else if (vendor.serviceType === "4") {
                serviceTypeName = "Heavy Vehicle"; // Fixed spelling
            }
            return {
                ...vendor.toObject(), // Ensure we return a plain object
                serviceTypeName,
                profileImage: ganerateOneLineImageUrls(vendor.profileImage, req)
            };
        });


        // Send response
        res.status(200).json({
            type: 'success',
            message: 'Vendor list retrieved successfully',
            totalVendors,
            totalPages: Math.ceil(totalVendors / limitNumber),
            currentPage: pageNumber,
            vendors,
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            type: 'error',
            message: 'Error fetching vendor list',
            error: error.message
        });
    }
};

const deActiveVendorAccount = async (req, res) => {
    try {
        const { id } = req.user
        let vendor = await Vendor.findById(id);
        vendor.isActive = false
        await vendor.save()

        res.status(200).json({
            type: 'success',
            message: 'account deactivated successfully',
        });
    } catch (error) {
        res.status(500).json({
            type: 'error',
            message: 'Error for deactivate account',
            error: error.message
        });
    }
}

const deleteVendorAccount = async (req, res) => {
    try {
        const { id } = req.user
        let vendor = await Vendor.findById(id);
        vendor.isDeleted = true
        await vendor.save()

        res.status(200).json({
            type: 'success',
            message: 'account deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            type: 'error',
            message: 'Error for delete account',
            error: error.message
        });
    }
}

const getVendorSubscriptionDetails = asyncHandler(async (req, res) => {
    try {
        const vendorId = req.user.id;

        // Check if vendor exists
        const vendor = await Vendor.findById(vendorId);
        if (!vendor) {
            return res.status(404).json({
                message: 'Vendor not found',
                type: 'error',
            });
        }

        // Fetch vendor's latest subscription history
        const subscriptionHistory = await SubscriptionHistory.findOne({ vendorId })
            .sort({ purchaseDate: -1 }); // Get the latest subscription

        let isSubscriptionActive = false;
        let currentActiveSubscription = null;

        if (subscriptionHistory) {
            // Get current date in IST (Indian Standard Time) and format it as DD-MM-YYYY
            const nowIST = new Date().toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata' });

            // Convert subscription start and end dates to DD-MM-YYYY format
            const startDateIST = subscriptionHistory.startDate;
            const endDateIST = subscriptionHistory.endDate

            // Compare formatted dates
            if (nowIST >= startDateIST && nowIST <= endDateIST) {
                isSubscriptionActive = true;
                currentActiveSubscription = subscriptionHistory._id;
            }
        }

        return res.status(200).json({
            subscriptionHistory,
            currentActiveSubscription,
            isSubscriptionActive,
            type: 'success',
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to retrieve vendor subscription details',
            error: error.message,
            type: 'error',
        });
    }
});


module.exports = {
    getVendorProfile,
    updateVendorProfile,
    filterVendors,
    vendorDetails,
    getVendorsForAdmin,
    deleteVendorAccount,
    deActiveVendorAccount,
    getVendorSubscriptionDetails
};
