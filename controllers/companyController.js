const asyncHandler = require('express-async-handler');
const Company = require('../models/company');

// Add Company
const addCompany = asyncHandler(async (req, res) => {
    try {
        const companyData = {
            ...req.body,
        };

        const existingCompany = await Company.findOne(req.body)

        if (existingCompany) {
            return res.status(400).json({
                message: 'Company already exist',
                type: 'error'
            });
        }

        const company = new Company(companyData);
        await company.save();

        return res.status(201).json({
            message: 'Company added successfully',
            type: 'success',
            company,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to add company',
            error: error.message,
            type: 'error',
        });
    }
});

// Get Company by ID or all Companies for the user
const getCompany = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { id: userId, role } = req.user;
        let company;

        if (id) {
            // Get a specific company by ID
            company = await Company.findOne({ _id: id });

            if (!company) {
                return res.status(404).json({
                    message: 'Company not found',
                    type: 'error',
                });
            }
        } else {
            // Get all companyes for the user
            company = await Company.find({ isDeleted: false });
        }

        return res.status(200).json({
            company,
            type: 'success',
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to retrieve company',
            error: error.message,
            type: 'error',
        });
    }
});

const getCompanyForAdmin = async (req, res) => {
    try {
        const { search, page = 1, limit = 10 } = req.query; // Get search term, page, and limit from query parameters

        // Ensure page and limit are valid integers
        const pageNumber = parseInt(page) || 1;
        const limitNumber = parseInt(limit) || 10;

        let searchQuery = {};
        if (search && search.trim() !== '') {
            const regex = new RegExp(search.trim(), 'i'); // Case-insensitive partial match
            searchQuery = {
                $or: [
                    { name: regex },
                ]
            };
        }

        const totalCompanies = await Company.countDocuments(searchQuery);

        let companies = await Company.find(searchQuery)
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)
            .sort({ createdAt: -1 }); // Sort by creation date, newest first

        companies = companies.map((company) => {
            let serviceTypeName = "";
            if (company.serviceType === "1") {
                serviceTypeName = "2 wheeler";
            } else if (company.serviceType === "2") {
                serviceTypeName = "3 wheeler";
            } else if (company.serviceType === "3") {
                serviceTypeName = "4 wheeler";
            } else if (company.serviceType === "4") {
                serviceTypeName = "Heavy Vehicle"; // Fixed spelling
            }
            return {
                ...company.toObject(), // Ensure we return a plain object
                serviceTypeName
            };
        });

        // Send response
        res.status(200).json({
            type: 'success',
            message: 'Companies list retrieved successfully',
            totalCompanies,
            totalPages: Math.ceil(totalCompanies / limitNumber),
            currentPage: pageNumber,
            companies,
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            type: 'error',
            message: 'Error fetching companies list',
            error: error.message
        });
    }
};

// Update Company
const updateCompany = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const company = await Company.findOne({ _id: id });

        if (!company) {
            return res.status(404).json({
                message: 'Company not found',
                type: 'error',
            });
        }

        // Update only the provided fields
        Object.assign(company, req.body);

        await company.save();

        return res.status(200).json({
            message: 'Company updated successfully',
            type: 'success',
            company,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to update company',
            error: error.message,
            type: 'error',
        });
    }
});

// Delete Company (by ID or all)
const deleteCompany = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        if (id) {
            // Delete a specific company by ID
            const company = await Company.findById(id);

            if (!company) {
                return res.status(404).json({
                    message: 'Company not found',
                    type: 'error',
                });
            }

            company.isDeleted = true;
            // await Company.findByIdAndDelete(id)
            await company.save()

            return res.status(200).json({
                message: 'Company deleted successfully',
                type: 'success',
            });
        } else {
            // Delete all companies
            // await Company.deleteMany();

            return res.status(200).json({
                message: 'All companies deleted successfully',
                type: 'success',
            });
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: 'Failed to delete company',
            error: error.message,
            type: 'error',
        });
    }
});

module.exports = {
    addCompany,
    updateCompany,
    getCompany,
    deleteCompany,
    getCompanyForAdmin
};
