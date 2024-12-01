const invoice = require('../models/invoice');
const Invoice = require('../models/invoice')

const generateInvoiceCode = async ({ type, fromVendorId, toId, toModel }) => {
    try {
        // Define the invoice prefixes based on the type
        const typePrefixes = {
            "0": "booking",
            "1": "sale",
            "2": "counterSale",
            "3": "saleReturn",
            "4": "purchase",
            "5": "purchaseReturn",
            "6": "counterSaleReturn"
        };

        // Use default 'booking' if type is undefined or not in the list
        const invoicePrefix = typePrefixes[type] || "booking";

        // Find the latest invoice for the vendor sorted by number in descending order
        const lastInvoice = await Invoice.findOne({ from: fromVendorId, type }).sort({ number: -1 });

        // Determine the next invoice number (start from 1 if no previous invoice exists)
        const nextInvoiceNumber = lastInvoice ? lastInvoice.number + 1 : 1;

        // Generate the invoice code
        const invoiceCode = `${invoicePrefix}#${nextInvoiceNumber}`;

        // Create a new invoice with the generated number and invoiceCode
        const newInvoice = new Invoice({
            number: nextInvoiceNumber,
            invoiceCode,
            type, // type of invoice (sale, booking, etc.)
            from: fromVendorId, // Vendor creating the invoice
            to: toId, // The recipient (user or another vendor)
            toModel // The model of the recipient (User or Vendor)
        });
        // Save the new invoice to the database
        await newInvoice.save();

        // Return the newly created invoice details
        return newInvoice
    } catch (error) {
        throw new Error(`Error generating invoice code: ${error.message}`);
    }
};

module.exports = { generateInvoiceCode };
