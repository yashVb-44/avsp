const expressAsyncHandler = require('express-async-handler');
const Transaction = require('../models/transaction')
const Wallet = require('../models/wallet')

// const getVendorAllTransaction = expressAsyncHandler(async (req, res) => {
//     try {
//         const vendor = req.user;
//         const transaction = await Transaction.find({ owner: vendor.id }).populate("invoiceId").populate("customer").sort({ createdAt: -1 })

//         return res.status(200).json({
//             message: "all transaction get successfully",
//             type: "success",
//             transaction,
//         });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({
//             message: "Failed to get transaction",
//             error: error.message,
//             type: "error",
//         });
//     }
// });

// const getVendorAllTransaction = expressAsyncHandler(async (req, res) => {
//     try {
//         const vendor = req.user;

//         // Step 1: Fetch all transactions for the vendor, populate the customer field
//         const transactions = await Transaction.find({ owner: vendor.id })
//             .populate("invoiceId")   // Populate invoiceId
//             .populate("customer")    // Populate customer
//             .sort({ createdAt: -1 });

//         // Step 2: Loop over each transaction and fetch the corresponding wallet name for each customer
//         for (let transaction of transactions) {
//             if (transaction.customer && transaction.customer._id) {
//                 // Step 3: Find the wallet associated with this customer and vendor
//                 const wallet = await Wallet.findOne({
//                     $or: [
//                         { customer: transaction.customer._id, owner: vendor.id }, // Wallet linked to customer
//                         // { owner: transaction.customer._id, customer: vendor.id }  // Wallet linked to vendor (for some reason)
//                     ]
//                 }).select("name"); // Select only the 'name' field from the Wallet model

//                 // Step 4: Set the showName field from the wallet's name
//                 if (wallet) {
//                     transaction.showName = wallet.name;
//                 } else {
//                     transaction.showName = ''; // If no wallet is found, set it to empty
//                 }
//             } else {
//                 transaction.showName = ''; // If no valid customer, set showName to empty
//             }
//         }

//         // Step 5: Return the transactions with the showName field added
//         return res.status(200).json({
//             message: "All transactions retrieved successfully",
//             type: "success",
//             transactions, // Return the transactions with the showName field populated
//         });

//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({
//             message: "Failed to retrieve transactions",
//             error: error.message,
//             type: "error",
//         });
//     }
// });

const getVendorAllTransaction = expressAsyncHandler(async (req, res) => {
    try {
        const vendor = req.user;

        // Step 1: Get pagination parameters from the query
        const page = parseInt(req.query.page) || 1; // Default to page 1
        const limit = parseInt(req.query.limit) || 10; // Default to 10 transactions per page
        const skip = (page - 1) * limit;

        // Step 2: Fetch paginated transactions for the vendor, populate the customer field
        const transactions = await Transaction.find({ owner: vendor.id })
            .populate("invoiceId") // Populate invoiceId
            .populate("customer")  // Populate customer
            .sort({ createdAt: -1 })
            .skip(skip) // Skip records for pagination
            .limit(limit); // Limit the number of records per page

        // Step 3: Add showName to each transaction based on Wallet data
        for (let transaction of transactions) {
            if (transaction.customer && transaction.customer._id) {
                const wallet = await Wallet.findOne({
                    $or: [
                        { customer: transaction.customer._id, owner: vendor.id },
                    ]
                }).select("name");

                transaction.showName = wallet ? wallet.name : ''; // Set showName
            } else {
                transaction.showName = ''; // Set empty if no valid customer
            }
        }

        // Step 4: Get the total count of transactions for pagination metadata
        const totalTransactions = await Transaction.countDocuments({ owner: vendor.id });

        // Step 5: Return paginated results with metadata
        return res.status(200).json({
            message: "Transactions retrieved successfully",
            type: "success",
            total: totalTransactions,
            page,
            limit,
            totalPages: Math.ceil(totalTransactions / limit),
            transactions, // Paginated transactions with showName
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