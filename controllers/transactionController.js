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

module.exports = { getVendorAllTransaction, getAllTransactionWithFilter }