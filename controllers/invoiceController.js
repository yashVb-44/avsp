const asyncHandler = require('express-async-handler');
const Invoice = require('../models/invoice');
const SaleInvoice = require('../models/saleInvoice');
const PurchaseInvoice = require('../models/purchaseInvoice');
const Booking = require('../models/booking');
const Transaction = require('../models/transaction');
const Vendor = require('../models/vendor');
const User = require('../models/user');
const Address = require('../models/address');
const Garage = require('../models/garage');

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
    const vendorId = req?.user?.id
    const { id } = req.params;
    const saleInvoice = await SaleInvoice.findById(id).populate('to from productWithPrice.productId invoice');
    let booking = await Booking.findById(id)
      .populate('user') // Populate user details
      .populate('vendor') // Populate vendor details
      .populate('myVehicle') // Populate vehicle details
      .populate('services') // Populate service details
      .populate('pickupAddress') // Populate pickup address details
      .populate('dropAddress') // Populate drop address details
      .populate('garage')
      .populate('SubMechanic')


    if (!saleInvoice && !booking) {
      return res.status(404).send("Invoice not found");
    }

    const garage = await Garage.findOne({ vendorId })
    let htmlContent = ''
    let invoiceStyle = `
<style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .invoice-box {
          max-width: 800px;
          margin: auto;
          padding: 20px;
          border: 1px solid #ddd;
          background-color: #fff;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
        }
        .invoice-box table {
          width: 100%;
          line-height: 24px;
          text-align: left;
          border-collapse: collapse;
        }
        .invoice-box table th, .invoice-box table td {
          padding: 8px;
          border-bottom: 1px solid #ddd;
        }
        .invoice-box table th {
          background-color: #eee;
          font-weight: bold;
        }
        .invoice-box .title {
          font-size: 36px;
          color: #333;
        }
        .invoice-box .info-table td {
          padding-bottom: 10px;
        }
        .invoice-box .total-row td {
          font-weight: bold;
          border-top: 2px solid #eee;
        }
        .invoice-box .text-right {
          text-align: right;
        }
      </style>`

    if (saleInvoice) {
      const { invoice, type, to, from, productWithPrice, subTotal, remainingAmount, isPaid, date } = saleInvoice;
      htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice</title>
      ${invoiceStyle}
    </head>
    <body>
      <div class="invoice-box">
        <table class="info-table">
          <tr>
            <td class="title">
              ${garage?.name ? garage.name : 'N/A'}
            </td>
            <td class="text-right">
              Invoice : ${invoice ? invoice.invoiceCode : 'N/A'}<br>
              Created: ${new Date(invoice?.createdAt).toLocaleDateString()}
            </td>
          </tr>
          <tr>
            <td>
              <strong>From:</strong> ${from ? from.name : 'N/A'}<br>
              ${from ? from.email : 'N/A'}<br>
              ${garage ? garage.address : 'N/A'}
            </td>
            <td class="text-right">
              <strong>To:</strong> ${to ? to.name : 'Customer Name'}<br>
              ${to ? to.mobileNo : 'xxxxxxxxxx'}
            </td>
          </tr>
        </table>
        
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Price (₹)</th>
              <th>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${productWithPrice.map(item => `
              <tr>
                <td>${item.productName || 'Unnamed Product'}</td>
                <td>${item.quantity}</td>
                <td class="text-right">${item.price}</td>
                <td class="text-right">${item.price * item.quantity}</td>
              </tr>`).join('')}
            <tr class="total-row">
              <td colspan="3" class="text-right">Total:</td>
              <td class="text-right">₹${subTotal}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </body>
    </html>
  `;
    }

    if (booking) {
      const {
        invoice,
        user,
        vendor,
        productWithPrice,
        paidAmount,
        payableAmount,
        discountAmount,
        advancePayAmount,
        remainingAmount,
        quatationNo,
        scheduleTime,
        scheduleDate,
        myVehicle,
        SubMechanic,
        serviceWithPrice,
        labourCharges,
        estimatedCost,
        dropOffCharge,
        pickUpCharge
      } = booking

      const userAddress = await Address.findOne({ user: user._id }).select("address")
      htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice</title>
      ${invoiceStyle}
    </head>
    <body>
      <div class="invoice-box">
        <table class="info-table">
          <tr>
            <td class="title">
              ${garage?.name ? garage.name : 'N/A'}
            </td>
            <td class="text-right">
              Quatation No : ${quatationNo || 'N/A'}<br>
              Date & Time : ${scheduleDate} ${scheduleTime}
            </td>
          </tr>
          <tr>
            <td>
              <strong>From:</strong> ${vendor ? vendor.name : 'N/A'}<br>
              ${vendor ? vendor.email : 'N/A'}<br>
              ${vendor ? vendor.mobileNo : 'N/A'}<br>
              ${garage ? garage.address : 'N/A'}
            </td>
            <td>
            </td>
          </tr>
          <tr>
             <td>
              <strong>To:</strong>${user ? user.name : 'Customer Name'}<br>
              ${user ? user.mobileNo : 'N/A'}<br>
              ${userAddress ? userAddress.address : 'N/A'}<br>
            </td>
            <td>
            </td>
          </tr>
           <tr>
            <td>
              <strong>Vehicle Info</strong><br> ${myVehicle ? myVehicle.name : 'N/A'}<br>
              ${myVehicle ? myVehicle.number : 'N/A'}<br>
            </td>
            <td>
              <strong>Work performed by</strong><br> <b>Mechanic :-</b> ${vendor ? vendor.name : 'N/A'}<br>
              <b>Sub Mechanic :-</b> ${SubMechanic ? SubMechanic.name : 'N/A'}<br>
            </td>
          </tr>
        </table>
        
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Rate (₹)</th>
              <th>labour charge (₹)</th>
              <th>Total (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${productWithPrice.map(item => `
              <tr>
                <td>${item.productName || 'Unnamed Product'}</td>
                <td>${item.quantity}</td>
                <td class="text-right">${item.price}</td>
                <td class="text-right">${item.labourCharges || 0}</td>
                <td class="text-right">${item.price * item.quantity}</td>
              </tr>`).join('')}
             ${serviceWithPrice.map(item => `
              <tr>
                <td>${item.serviceName || 'Unnamed Service'}</td>
                <td>${1}</td>
                <td class="text-right">${item.price}</td>
                <td class="text-right">${item.labourCharges || 0}</td>
                <td class="text-right">${item.price}</td>
              </tr>`).join('')}
            ${dropOffCharge > 0 && `
          <tr class="total-row">
            <td colspan="4" class="text-right">Drop Charge:</td>
            <td class="text-right">₹${dropOffCharge}</td>
          </tr>`}
             ${pickUpCharge > 0 && `
          <tr class="total-row">
            <td colspan="4" class="text-right">Pick Up Charge:</td>
            <td class="text-right">₹${pickUpCharge}</td>
          </tr>`}
            <tr class="total-row">
              <td colspan="4" class="text-right">Labour Charges (INR):</td>
              <td class="text-right">₹${labourCharges}</td>
            </tr>
            <tr class="total-row">
              <td colspan="4" class="text-right">Estimated Cost:</td>
              <td class="text-right">₹${estimatedCost}</td>
            </tr>
            ${discountAmount > 0 && `
          <tr class="total-row">
            <td colspan="4" class="text-right">Discount:</td>
            <td class="text-right">-₹${discountAmount}</td>
          </tr>`}
            ${payableAmount > 0 && `
          <tr class="total-row">  
            <td colspan="4" class="text-right">Payable Amount:</td>
            <td class="text-right">₹${payableAmount}</td>
          </tr>`}
          </tbody>
        </table>
      </div>
    </body>
    </html>
  `;
    }

    res.send(htmlContent)

  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// const getPartyInvoicesByVendor = async (req, res) => {
//     try {
//         const { partyId } = req.params;  // Assuming partyId is passed in the params

//         // Fetch all invoices for the given party (userId or vendorId) using the 'to' field
//         const invoices = await Invoice.find({ to: partyId }).populate('from').populate('to'); // Populating 'from' and 'to' references for better details

//         if (invoices.length === 0) {
//             return res.status(404).json({
//                 message: 'No invoices found for this party',
//                 type: 'error'
//             });
//         }

//         const invoiceDetails = await Promise.all(invoices.map(async (invoice) => {
//             let saleInvoiceDetails = null;
//             let purchaseInvoiceDetails = null;
//             let bookingDetails = null;

//             // Fetch sale invoice details if any
//             if (await SaleInvoice.exists({ invoice: invoice._id })) {
//                 saleInvoiceDetails = await SaleInvoice.findOne({ invoice: invoice._id }).lean();
//             }

//             // Fetch purchase invoice details if any
//             if (await PurchaseInvoice.exists({ invoice: invoice._id })) {
//                 purchaseInvoiceDetails = await PurchaseInvoice.findOne({ invoice: invoice._id }).lean();
//             }

//             // Fetch booking details if any
//             if (await Booking.exists({ invoice: invoice._id })) {
//                 bookingDetails = await Booking.findOne({ invoice: invoice._id }).lean();
//             }

//             // Return the combined invoice object with additional details
//             return {
//                 ...invoice,
//                 saleInvoiceDetails,
//                 purchaseInvoiceDetails,
//                 bookingDetails
//             };
//         }));

//         // Send the response with the found invoices
//         res.status(200).json({
//             message: 'Invoices retrieved successfully',
//             type: 'success',
//             data: invoiceDetails
//         });

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             message: 'Server error',
//             type: 'error'
//         });
//     }
// };

const getPartyInvoicesByVendor = async (req, res) => {
  try {
    const { partyId } = req.params;  // Assuming partyId is passed in the params
    const { id } = req.user

    // Fetch all invoices for the given party (userId or vendorId) using the 'to' field
    const invoices = await Invoice.find({ to: partyId })
      .populate('from') // Populating 'from' (Vendor)
      .populate('to') // Populating 'to' (User or Vendor)
      .lean() // Using lean for better performance if you don't need to modify documents
      .sort({ createdAt: -1 })

    if (invoices.length === 0) {
      return res.status(404).json({
        message: 'No invoices found for this party',
        type: 'error'
      });
    }

    // Initialize arrays to store categorized invoices
    let saleInvoices = [];
    let purchaseInvoices = [];
    let bookings = [];

    // Loop through invoices and categorize them into Sale, Purchase, and Booking invoices
    await Promise.all(invoices.map(async (invoice) => {
      // Check for SaleInvoice and add to saleInvoices array
      if (await SaleInvoice.exists({ invoice: invoice._id, from: id })) {
        const saleInvoiceDetails = await SaleInvoice.findOne({ invoice: invoice._id, from: id }).lean();
        saleInvoices.push({
          ...invoice,
          invoiceId: saleInvoiceDetails._id,
          saleInvoiceDetails
        });
      }

      // Check for PurchaseInvoice and add to purchaseInvoices array
      if (await PurchaseInvoice.exists({ invoice: invoice._id, from: id })) {
        const purchaseInvoiceDetails = await PurchaseInvoice.findOne({ invoice: invoice._id, from: id }).lean();
        purchaseInvoices.push({
          ...invoice,
          purchaseInvoiceDetails
        });
      }

      // Check for Booking and add to bookings array
      if (await Booking.exists({ invoice: invoice._id, vendor: id })) {
        const bookingDetails = await Booking.findOne({ invoice: invoice._id, vendor: id }).lean();
        bookings.push({
          ...invoice,
          bookingDetails
        });
      }
    }));

    // Send the response with categorized invoices
    res.status(200).json({
      message: 'Invoices retrieved successfully',
      type: 'success',
      data: {
        saleInvoices,     // All sale invoices
        purchaseInvoices, // All purchase invoices
        bookings          // All booking invoices
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Server error',
      type: 'error'
    });
  }
};

const getTransactionsByInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;  // Assuming invoiceId is passed in the params
    const transactions = await Transaction.find({
      $or: [
        { invoiceId: invoiceId }, // Transactions where 'invoiceId' is a direct match
        { 'transactions.invoiceId': invoiceId } // Transactions where 'transactions' array contains an invoice with the given id
      ]
    })
      .populate('customer') // Populating 'customer' (User, Vendor, or TempVendor)
      .populate('owner')    // Populating 'owner' (User or Vendor)
      .sort({ createdAt: -1 }) // Sorting by creation date, latest first
      .lean();              // Using lean for performance optimization


    if (transactions.length === 0) {
      return res.status(404).json({
        message: 'No transactions found for this invoice',
        type: 'error'
      });
    }

    // Send the response with the found transactions
    res.status(200).json({
      message: 'Transactions retrieved successfully',
      type: 'success',
      data: transactions
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Server error',
      type: 'error'
    });
  }
};

module.exports = {
  getNextInvoiceNumber,
  generateInvoiceHTML,
  getPartyInvoicesByVendor,
  getTransactionsByInvoice
};
