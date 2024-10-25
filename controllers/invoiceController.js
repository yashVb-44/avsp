const asyncHandler = require('express-async-handler');
const Invoice = require('../models/invoice');
const SaleInvoice = require('../models/saleInvoice');

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

const generateInvoiceHTML = async (req, res) => {
    try {
        // Find the invoice by ID
        const { id } = req.params;
        const saleInvoice = await SaleInvoice.findById(id).populate('to from productWithPrice.productId invoice');

        if (!saleInvoice) {
            return res.status(404).send("Invoice not found");
        }

        // Extract data from saleInvoice
        const { invoice, type, to, from, productWithPrice, subTotal, remainingAmount, isPaid, date } = saleInvoice;

        // Create dynamic HTML content
        const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice</title>
        <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
    }

    .invoice-box {
      max-width: 800px;
      margin: auto;
      padding: 30px;
      border: 1px solid #eee;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
      font-size: 16px;
      line-height: 24px;
      color: #555;
    }

    .invoice-box table {
      width: 100%;
      line-height: inherit;
      text-align: left;
    }

    .invoice-box table td {
      padding: 5px;
      vertical-align: top;
    }

    .invoice-box table tr td:nth-child(2) {
      text-align: right;
    }

    .invoice-box table tr.top table td {
      padding-bottom: 20px;
    }

    .invoice-box table tr.information table td {
      padding-bottom: 40px;
    }

    .invoice-box table tr.heading td {
      background: #eee;
      border-bottom: 1px solid #ddd;
      font-weight: bold;
    }

    .invoice-box table tr.details td {
      padding-bottom: 20px;
    }

    .invoice-box table tr.item td {
      border-bottom: 1px solid #eee;
    }

    .invoice-box table tr.item.last td {
      border-bottom: none;
    }

    .invoice-box table tr.total td:nth-child(2) {
      border-top: 2px solid #eee;
      font-weight: bold;
    }
  </style>
      </head>
      <body>
        <div class="invoice-box">
          <table>
            <tr class="top">
              <td colspan="2">
                <table>
                  <tr>
                    <td class="title">
                      <h1>Company Logo</h1>
                    </td>
                    <td>
                      Invoice : ${invoice ? invoice.invoiceCode : 'N/A'}<br>
                      Created: ${new Date(invoice?.createdAt).toLocaleDateString()}<br>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr class="information">
              <td colspan="2">
                <table>
                  <tr>
                    <td>
                      ${from ? from.name : 'N/A'}<br>
                      ${from ? from.email : 'N/A'}
                    </td>
                    <td>
                      ${to ? to.name : 'Customer Name'}<br>
                      ${to ? to.mobileNo : 'xxxxxxxxxx'}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr class="heading">
              <td>Item</td>
              <td>Price</td>
            </tr>
            ${productWithPrice.map(item => `
              <tr class="item">
                <td>${item.productName || 'Unnamed Product'}</td>
                <td>₹${item.quantity}</td>
                <td>₹${item.price}</td>
              </tr>`).join('')}
            <tr class="total">
              <td></td>
              <td>Total: ₹${subTotal}</td>
            </tr>
            <tr class="total">
              <td></td>
              <td>Remaining:₹${remainingAmount}</td>
            </tr>
          </table>
        </div>
      </body>
      </html>
    `;

        // Send the HTML content as the response
        res.send(htmlContent);

    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
};


module.exports = {
    getNextInvoiceNumber,
    generateInvoiceHTML
};
