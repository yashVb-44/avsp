const expressAsyncHandler = require('express-async-handler');
const Transaction = require('../models/transaction')

const getVendorAllTransaction = expressAsyncHandler(async (req, res) => {
    try {
        const vendor = req.user;
        const transaction = await Transaction.find({ owner: vendor.id }).sort({ createdAt: -1 })

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

module.exports = { getVendorAllTransaction }