const expressAsyncHandler = require('express-async-handler');
const Transaction = require('../models/transaction')

const getVendorAllTransaction = expressAsyncHandler(async (req, res) => {
    try {
        const vendor = req.user;
        const transaction = await Transaction.find({ owner: vendor.id }).populate("invoiceId").populate("customer").sort({ createdAt: -1 })

        return res.status(200).json({
            message: "all transaction get successfully",
            type: "success",
            transaction,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Failed to get transaction",
            error: error.message,
            type: "error",
        });
    }
});

const getAllTransactionWithFilter = expressAsyncHandler(async (req, res) => {
    try {
        const { type, subType, startDate, endDate } = req.body; // Get filters from req.body
        const vendor = req.user;

        // Build the query object dynamically
        let query = {
            owner: vendor.id
        };

        // Add type filter if provided
        if (type !== undefined) {
            query.transactionType = type; // transactionType corresponds to 'type'
        }

        // Add subType filter if provided
        if (subType !== undefined) {
            query.subType = subType; // subType corresponds to 'subType'
        }

        // Add date range filter if both startDate and endDate are provided
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),  // Greater than or equal to startDate
                $lte: new Date(endDate)     // Less than or equal to endDate
            };
        }

        // Execute the query with sorting and populate relevant fields
        const transactions = await Transaction.find(query)
            .populate("invoiceId")
            .populate("customer")
            .sort({ createdAt: -1 }); // Sort by most recent first

        // Send response
        return res.status(200).json({
            message: "Transactions fetched successfully",
            type: "success",
            transactions,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Failed to get transactions",
            error: error.message,
            type: "error",
        });
    }
});

const getPartyTransactionsByVendor = expressAsyncHandler(async (req, res) => {
    try {
        const { id } = req.user
        const { partyId } = req.params; // Party ID from request parameters
        const { type } = req.query;     // Type from query parameters (e.g., "credit" for payment in or "debit" for payment out)

        // Define filters based on type
        let typeFilter = {};
        if (type === '1') {
            typeFilter.subType = "3"; // Payment in (credit - payment in)
        } else if (type === '2') {
            typeFilter.subType = "4"; // Payment out (debit - payment out)
        }

        // Fetch transactions for the particular party with the specified filters
        const transactions = await Transaction.find({
            owner: id,
            customer: partyId,          // Match the specified party's ID as the owner
            ...typeFilter              // Apply the filter for subType
        })
            .populate("invoiceId")
            .populate("customer")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Transactions retrieved successfully",
            type: "success",
            transactions,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Failed to retrieve transactions",
            error: error.message,
            type: "error",
        });
    }
});


module.exports = { getVendorAllTransaction, getAllTransactionWithFilter, getPartyTransactionsByVendor }