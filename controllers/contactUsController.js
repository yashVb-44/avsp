const asyncHandler = require('express-async-handler');
const ContactUs = require('../models/contactUs');

// Add Contact Inquiry
const addContactUs = asyncHandler(async (req, res) => {
    try {
        const { role, id } = req.user
        const { type } = req.body
        const contactUsData = {
            ...req.body,
            customer: id,
            customerModel: type === "0" ? "User" : "Vendor"
        };

        const contactUs = new ContactUs(contactUsData);
        await contactUs.save();

        return res.status(201).json({
            message: 'Contact inquiry submitted successfully',
            type: 'success',
            contactUs,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to submit contact inquiry',
            error: error.message,
            type: 'error',
        });
    }
});

// Get Contact Inquiry by ID or all Contact Inquiries
const getContactUs = asyncHandler(async (req, res) => {
    try {
        const { id: customerId, role } = req.user
        const { id } = req.params;
        let contactInquiry;

        if (id) {
            // Get specific contact inquiry by ID
            role === "admin" ? contactInquiry = await ContactUs.findOne({ _id: id }).populate('customer') : contactInquiry = await ContactUs.findOne({ _id: id, customer: customerId }).populate('customer')
            if (!contactInquiry) {
                return res.status(404).json({
                    message: 'Contact inquiry not found',
                    type: 'error',
                });
            }
        } else {
            // Get all contact inquiries
            role === "admin" ? contactInquiry = await ContactUs.find().populate('customer').sort({ createdAt: -1 }) : contactInquiry = await ContactUs.find({ customer: customerId }).populate('customer').sort({ createdAt: -1 })
        }

        return res.status(200).json({
            message: 'Contact inquiries retrieved successfully',
            type: 'success',
            contactInquiry,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to retrieve contact inquiries',
            error: error.message,
            type: 'error',
        });
    }
});

// Get Services for Admin
const getContactUsForAdmin = async (req, res) => {
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
                    // { message: regex },
                    { subject: regex },
                    { name: regex },
                    { mobileNo: regex },
                ]
            };
        }

        // Calculate total services matching the query
        const totalSupportData = await ContactUs.countDocuments(searchQuery);


        let supportData = await ContactUs.find(searchQuery)
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)
            .sort({ createdAt: -1 }); // Sort by creation date, newest first

        supportData = supportData.map((status) => {
            let statusTypeName = "";
            if (status.status === "0") {
                statusTypeName = "Pending";
            } else if (status.status === "1") {
                statusTypeName = "Approved";
            } else if (status.status === "2") {
                statusTypeName = "Rejected";
            } else if (status.status === "3") {
                statusTypeName = "Ongoing";
            } else if (status.status === "4") {
                statusTypeName = "Completed";
            }
            return {
                ...status.toObject(), // Ensure we return a plain object
                statusTypeName
            };
        });

        // Send response
        res.status(200).json({
            type: 'success',
            message: 'data list retrieved successfully',
            totalSupportData,
            totalPages: Math.ceil(totalSupportData / limitNumber),
            currentPage: pageNumber,
            supportData,
        });
    } catch (error) {
        res.status(500).json({
            type: 'error',
            message: 'Error fetching data list',
            error: error.message
        });
    }
};


// Update Contact Inquiry Status
const updateContactUs = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const contactUs = await ContactUs.findOne({ _id: id });

        if (!contactUs) {
            return res.status(404).json({
                message: 'Contact inquiry not found',
                type: 'error',
            });
        }

        // Update only the provided fields (typically status)
        Object.assign(contactUs, req.body);

        await contactUs.save();

        return res.status(200).json({
            message: 'Contact inquiry updated successfully',
            type: 'success',
            contactUs,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to update contact inquiry',
            error: error.message,
            type: 'error',
        });
    }
});

// Delete Contact Inquiry (by ID or all)
const deleteContactUs = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        if (id) {
            // Delete a specific contact inquiry by ID
            const contactUs = await ContactUs.findById(id);

            if (!contactUs) {
                return res.status(404).json({
                    message: 'Contact inquiry not found',
                    type: 'error',
                });
            }

            await ContactUs.deleteOne({ _id: id });

            return res.status(200).json({
                message: 'Contact inquiry deleted successfully',
                type: 'success',
            });
        } else {
            // Delete all contact inquiries
            await ContactUs.deleteMany();

            return res.status(200).json({
                message: 'All contact inquiries deleted successfully',
                type: 'success',
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to delete contact inquiries',
            error: error.message,
            type: 'error',
        });
    }
});

module.exports = {
    addContactUs,
    getContactUs,
    updateContactUs,
    deleteContactUs,
    getContactUsForAdmin
};
