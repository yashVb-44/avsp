const asyncHandler = require('express-async-handler');
const Invoice = require('../models/invoice');

// Get Next Invoice Number
const getNextInvoiceNumber = asyncHandler(async (req, res) => {
    try {
        const user = req.user;
        const { type } = req.body;

        // Fetch the latest invoice for the user sorted by number in descending order
        const lastInvoice = await Invoice.findOne({ from: user.id }).sort({ number: -1 });

        // Determine the next invoice number (start from 1 if no previous invoice exists)
        const nextInvoiceNumber = lastInvoice ? lastInvoice.number + 1 : 1;

        // Define the invoice prefix based on the type
        const typePrefixes = {
            "0": "booking",
            "1": "sale",
            "2": "counterSale",
            "3": "saleReturn",
            "4": "purchase",
            "5": "purchaseReturn"
        };

        // Use default 'booking' if type is undefined or not in the list
        const invoicePrefix = typePrefixes[type] || "booking";

        // Generate the invoice code
        const invoiceCode = `${invoicePrefix}${nextInvoiceNumber}`;

        // Send response with next invoice number and code
        return res.status(200).json({
            nextInvoiceNumber,
            invoiceCode,
            type: 'success',
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to retrieve the next invoice number',
            error: error.message,
            type: 'error',
        });
    }
});

module.exports = {
    getNextInvoiceNumber,
};
