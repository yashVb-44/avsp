const asyncHandler = require('express-async-handler');
const numberToWords = require("number-to-words")
const Invoice = require('../models/invoice');
const SaleInvoice = require('../models/saleInvoice');
const PurchaseInvoice = require('../models/purchaseInvoice');
const Booking = require('../models/booking');
const Transaction = require('../models/transaction');
const Vendor = require('../models/vendor');
const User = require('../models/user');
const Address = require('../models/address');
const Garage = require('../models/garage');
const { getAllSettings } = require('../utils/settings');
const os = require('os');
const serverPath = process.env.Server_Img_Url

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

const innerStyle = `<style>
    @media print {
      .table-responsive {
        overflow: auto;
      }

      .table-responsive>.table tr th,
      .table-responsive>.table tr td {
        white-space: normal !important;
      }
    }

    .border-bottom-0 {
      border-bottom: 0 !important;
    }

    .border-1 {
      border: 1px solid #000;
    }

    .bs-0 {
      border-left: 0px solid #000 !important;
    }

    .p-0 {
      padding: 0 !important;
    }

    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0px;
      background-color: #f4f4f4;
    }

    .invoice-box {
      max-width: 800px;
      margin: auto;
      padding: 0 10px 10px;
      border: 1px solid transparent;
      background-color: #fff;
      /* box-shadow: 0 0 10px rgba(0, 0, 0, 0.15); */
    }

    .invoice-box table {
      width: 100%;
      line-height: 18px;
      text-align: left;
      border-collapse: collapse;
    }

    .invoice-box table th,
    .invoice-box table td {
      padding: 4px 8px;
      font-size: 12px;
      text-transform: capitalize;
      line-height: 15px;
      color: #333333;
    }

    .invoice-box table th {
      background-color: #eee;
      font-weight: bold;
    }

    .heading {
      text-transform: uppercase !important;
      font-weight: 600;
      font-size: 14px !important;
    }

    .invoice-box .title {
      font-size: 15.5px;
      color: #333;
      margin: 0 0 0 100px;
    }

    .invoice-table {
      border: 1px solid #000;
    }

    .invoice-table th {
      background-color: #fff !important;
      border: 1px solid #000;
    }

    .invoice-table .remove-line td {
      border-left: 1px solid #000 !important;
      border-bottom: 0 !important;
    }

    .d-flex {
      display: flex;
      align-items: center;
      gap: 7px;
    }

    .fw-600 {
      font-weight: 600;
    }

    .invoice-box .total-row td {
      font-weight: bold;
      border-top: 2px solid #000;
    }

    .bg-gray {
      background-color: #eee;
    }

    .invoice-box .text-right {
      text-align: right;
    }

    .blue-table {
      background-color: #00436914;
      border-radius: 8px;
      max-width: 500px;
      margin: 11px auto 0;
      border: 0;
      padding: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    p {
      margin: 4px 0;
    }

    .text-center {
      text-align: center;
    }

    .invoice-table .remove-line td:nth-child(2) {
      text-align: left;
    }
  </style>`

async function generateBookingInvoice({ booking, garage, isWithTax }) {

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
  const userAddress = await Address.findOne({ user: user?._id }).select("address")
  let subTotal = productWithPrice.reduce((sum, item) => sum + (item.price * item.quantity) + (item.labourCharges || 0), 0) +
    serviceWithPrice.reduce((sum, item) => sum + (item.price || 0) + (item.labourCharges || 0), 0);

  let gstTotal = productWithPrice.reduce(
    (sum, item) => sum + ((item.price * item.quantity * (item?.gst || 18)) / 100),
    0
  ) + serviceWithPrice.reduce(
    (sum, item) => sum + (((item.price || 0) * (item?.gst || 18)) / 100),
    0
  );

  let subtotal = isWithTax ? subTotal - gstTotal : subTotal
  // Calculate Grand Total
  let grandTotal = subTotal + labourCharges + dropOffCharge + pickUpCharge;

  // Convert Total Amount into Words
  let totalInWords = numberToWords.toWords(subtotal).toUpperCase() + " ONLY";
  let gstTotalInWords = numberToWords.toWords(gstTotal).toUpperCase() + " ONLY";
  const { setting } = await getAllSettings()


  const tableHead = isWithTax ? `<th style="width: 7%">Sr No.</th>
            <th style="width: 20%">Items</th>
            <th style="width: 10%">HSN Code</th>
            <th style="width: 8%">Qty</th>
            <th style="width: 12%">Rate (₹)</th>
            <th style="width: 8%">GST %</th>
            <th style="width: 12%">Labour Charge</th>
            <th style="width: 8%">Amount</th>`
    : `<tr class="text-center">
          <th style="width: 7%">Sr No.</th>
          <th style="width: 30%">Items</th>
          <th style="width: 10%">Qty</th>
          <th style="width: 12%">Rate (₹)</th>
          <th style="width: 12%">Labour Charge</th>
          <th style="width: 12%">Amount</th>
        </tr>`

  let htmlcode = `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice</title>
  ${innerStyle}
</head>

<body>
  <div class="invoice-box">
    <table class="info-table border-1">
      <tbody>
        <tr class="bg-gray">
          <td width="90%" align="center">
            <h3 class="title fw-600">${garage?.name || 'N/A'}</h3>
          </td>
          <td class="text-right p-48 d-flex" width="10%">
            <img src="${process.env.Server_Img_Url}/images/logo.png" alt="" height="40" /><span class="fw-600">SOWI</span>
          </td>
        </tr>
        <tr class="border-1">
          <td colspan="2" align="center">
            ${garage?.address || 'N/A'}
          </td>
        </tr>
        <tr class="border-1">
          <td colspan="2" align="center" class="heading">${isWithTax ? `BOOKING TAX INVOICE` : `BOOKING INVOICE`}</td>
        </tr>
      </tbody>
    </table>
    <table>
      <tbody>
        <tr style="
              border: 1px solid #000;
              border-top-width: 0;
              border-bottom-width: 0;
            ">
          <td class="p-0" width="50%">
            <table>
              <tbody>
                <tr>
                  <td class="border-bottom-0" style="padding: 0 15px; height: 50px">
                    <strong>From:</strong> ${vendor?.name || 'N/A'}<br />
                    ${vendor?.email || 'N/A'}<br />
                    ${vendor?.mobileNo || 'N/A'}
                  </td>
                </tr>
                <tr>
                  <td class="border-bottom-0" style="padding: 0 15px; height: 50px">
                    <strong>To:</strong>${user?.name || 'N/A'}<br />
                    ${user?.mobileNo || 'N/A'}<br />
                    ${userAddress?.address || 'N/A'}<br />
                  </td>
                </tr>
              </tbody>
            </table>
          </td>

          <td class="p-0" width="50%" style="border-left: 1px solid #000">
            <table class="bg-gray" style="height: 60px">
              <tbody>
                <tr>
                  <td class="border-bottom-0" style="padding: 0 15px">
                    <b>Invoice No :</b> <span>${invoice?.invoiceCode || 'N/A'}</span>
                  </td>
                  <td class="border-bottom-0" style="padding: 0 15px">
                    <b>Jobcard No :</b> <span>${quatationNo || 'N/A'}</span>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding: 0 15px">
                    <b>Date &amp; Time : </b><span>${scheduleDate || 'N/A'} ${scheduleTime || 'N/A'}</span>
                  </td>
                </tr>
              </tbody>
            </table>
            <table>
              <tbody>
                <tr>
                  <td class="border-1" style="padding: 5px 15px; border-left: 0">
                    Vehicle details
                  </td>
                  <td class="border-1" style="padding: 5px 15px; border-right: 0">
                    Mechanic details
                  </td>
                </tr>
                <tr>
                  <td class="border-1" style="
                        padding: 5px 15px;
                        border-left: 0;
                        border-bottom: 0;
                      ">
                    <p>${myVehicle ? myVehicle.name : 'N/A'}</p>
                    <p>${myVehicle ? myVehicle.number : 'N/A'}</p>
                  </td>
                  <td class="border-1" style="
                        padding: 5px 15px;
                        border-right: 0;
                        border-bottom: 0;
                      ">
                    <p>${vendor ? vendor.name : 'N/A'}</p>
                    <p><b>Sub Mechanic :-</b> ${SubMechanic ? SubMechanic.name : 'N/A'}</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>

    <table class="invoice-table">
      <thead>
        ${tableHead}
      </thead>
      <tbody>
      ${productWithPrice.map((item, index) => `
              <tr class="remove-line text-center">
                <td>${index + 1}</td>
                <td>${item.productName || 'Unnamed Product'}</td>
                ${isWithTax && `<td>${item?.hsn || 12345678}</td>`}
                <td>${item.quantity}</td>
                <td class="text-right">${item.price}</td>
                ${isWithTax && `<td>${item?.gst || 18}%</td>`}
                <td class="text-right">${item.labourCharges || 0}</td>
                <td class="text-right">${(item.price * item.quantity) + item.labourCharges}</td>
              </tr>`).join('')}
             ${serviceWithPrice.map((item, index) => `
              <tr class="remove-line text-center">
                <td>${productWithPrice.length + index + 1}</td>
                <td>${item.serviceName || 'Unnamed Service'}</td>
                ${isWithTax && `<td>${item?.sac || 12345678}</td>`}
                <td>${1}</td>
                <td class="text-right">${item.price}</td>
                ${isWithTax && `<td>${item?.gst || 18}%</td>`}
                <td class="text-right">${item.labourCharges || 0}</td>
                <td class="text-right">${item.price + item.labourCharges}</td>
              </tr>`).join('')}
        <tr class="bg-gray border-1">
          ${isWithTax ?
      `<td colspan=${6}>GSTIN number : <span>${garage?.gstNo || 'N/A'}</span></td>` :
      `<td colspan=${4}></td>`
    }
          <td class="fw-600" style="border-left: 1px solid #000">
            Sub Total
          </td>
          <td class="text-right fw-600">₹${subtotal || 0}</td>
        </tr>
       ${isWithTax ?
      `<tr>
            <td height="20" colspan="6" class="border-1">
              <p>bank name : <span> ${garage?.bankName || 'N/A'}</span></p>
              <p>bank account number : <span> ${garage?.accountNumber || 'N/A'}</span></p>
              <p>IFSC code : <span> ${garage?.ifsc || 'N/A'}</span></p>
            </td>
            <td colspan="2" class="border-bottom-0" height="20"></td>
          </tr>
          <tr>
            <td colspan="6" class="border-1">
              <p>total GST : <span> ${gstTotalInWords || 'N/A'}</span></p>
              <p>bill amount : <span> ${totalInWords || 'N/A'}</span></p>
            </td>
            <td colspan="2">
              <table>
                <tbody>
                  <tr>
                    <td
                      class="border-bottom-0 p-0 fw-600"
                      style="vertical-align: top"
                    >
                      taxable amount
                    </td>
                    <td
                      class="text-right border-bottom-0 p-0 fw-600"
                      style="vertical-align: top"
                      height="30"
                    >
                      ${subtotal}
                    </td>
                  </tr>
                  <tr>
                    <td class="border-bottom-0 p-0">Labour Charges (INR):</td>
                    <td class="text-right border-bottom-0 p-0">₹${labourCharges || 0}</td>
                  </tr>
                  <tr>
                    <td class="border-bottom-0 p-0">GST :</td>
                    <td class="text-right border-bottom-0 p-0">₹${gstTotal || 0}</td>
                  </tr>
                  <tr>
                    <td class="border-bottom-0 p-0">Pick Up Charge:</td>
                    <td class="text-right border-bottom-0 p-0">₹${pickUpCharge || 0}</td>
                  </tr>
                  <tr>
                    <td class="border-bottom-0 p-0">Drop Charge:</td>
                    <td class="text-right border-bottom-0 p-0">₹${dropOffCharge || 0}</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
          <tr class="border-1">
            <td colspan="2" height="40" style="border-right: 1px solid #000">
              Note :
            </td>
            <td height="50" class="border-bottom-0" colspan="4">
              <table>
                <tbody>
                  <tr>
                    <td>Bill Amount</td>
                    <td
                      style="text-align: right; border-bottom: 1px solid #000"
                      width="25%"
                    >
                      ${subtotal || 0}
                    </td>
                  </tr>

                  <tr>
                    <td>Total Amount</td>
                    <td style="text-align: right" width="25%"> ${grandTotal || 0}</td>
                  </tr>
                </tbody>
              </table>
            </td>

            <td class="fw-600" style="border-left: 1px solid #0e0000">
              grand total
            </td>
            <td class="fw-600 text-right">₹${grandTotal || 0}</td>
          </tr>` : `
           <tr>
          <td height="40" colspan="4" class="border-1">
            bill amount : ${totalInWords}
          </td>
          <td colspan="2" class="border-bottom-0"></td>
        </tr>
        <tr>
          <td colspan="4" class="border-1">Note :</td>
          <td colspan="2">
            <table>
              <tbody>
                <tr>
                  <td class="border-bottom-0 p-0">Drop Charge:</td>
                  <td class="text-right border-bottom-0 p-0">₹${dropOffCharge || 0}</td>
                </tr>
                <tr>
                  <td class="border-bottom-0 p-0">Pick Up Charge:</td>
                  <td class="text-right border-bottom-0 p-0">₹${pickUpCharge || 0}</td>
                </tr>
                <tr>
                  <td class="border-bottom-0 p-0">Labour Charges (INR):</td>
                  <td class="text-right border-bottom-0 p-0">₹${labourCharges || 0}</td>
                </tr>
                <tr>
                  <td class="border-bottom-0 p-0">Estimated Cost:</td>
                  <td class="text-right border-bottom-0 p-0">₹${estimatedCost || 0}</td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
        <tr class="border-1">
          <td height="50" class="border-bottom-0" colspan="2">
            <table>
              <tbody>
                <tr>
                  <td>Bill Amount</td>
                  <td style="text-align: right; border-bottom: 1px solid #000" width="30%">
                    ${subtotal || 0}
                  </td>
                </tr>

                <tr>
                  <td>Total Amount</td>
                  <td style="text-align: right" width="30%">${grandTotal || 0}</td>
                </tr>
              </tbody>
            </table>
          </td>
          <td colspan="2" height="40"></td>
          <td class="fw-600" style="border-left: 1px solid #0e0000">
            grand total
          </td>
          <td class="fw-600 text-right">₹${grandTotal || 0}</td>
        </tr>`
    }
      </tbody>
    </table>

    <table class="border-1" style="border-top-width: 0">
      <tbody>
        <tr>
          <td height="110">
            <h3 style="margin: 0; line-height: 20px; font-weight: 600">
              Terms &amp; Conditions
            </h3>
            <ul style="margin: 0; padding-left: 20px; list-style-type: decimal">
              ${setting?.invoiceTerms}
            </ul>
          </td>
          <td height="110">
            <table>
              <tbody>
                <tr>
                  <td class="border-bottom-0 text-right" height="50" style="vertical-align: top">
                    <b class="fw-600">from : </b>
                    <span>${garage?.name || 'N/A'}</span>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" class="border-bottom-0 text-right fw-600" style="vertical-align: bottom">
                    signature
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
        <tr>
          <td height="80" width="100%" align="center" colspan="2">
            <table class="blue-table border-1">
              <tbody>
                <tr>
                  <td class="border-bottom-0">
                    <img src="${process.env.Server_Img_Url}/images/logo.png" alt="SOWI Logo" style="height: 25px" />
                  </td>
                  <td style="font-weight: bold; border: 0">
                    Invoice Created Using SOWI App
                  </td>
                  <td class="border-bottom-0">
                    <a href="#" style="margin-right: 8px; text-decoration: none">
                      <img src="${process.env.Server_Img_Url}/images/playstore.png" alt="Get it on Google Play" style="height: 25px" />
                    </a>
                    <a href="#">
                      <img src="${process.env.Server_Img_Url}/images/appstore.png" alt="Download on the App Store" style="height: 25px" />
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="col-xs-2">
      <form>
        <button type="button" value="Print this page" onclick="printpage();" class="btn btn-default print-hide">
          <i class="fa fa-print"></i> Print
        </button>
      </form>
      <script>
        function printpage() {
          var is_chrome = function () {
            return Boolean(window.chrome);
          };
          if (is_chrome) {
            // Removing headers and footers for Chrome
            var style = document.createElement("style");
            style.type = "text/css";
            style.innerHTML =
              "@media print { @page { margin: 10px 0 0; } body { -webkit-print-color-adjust: exact; } .print-hide { display: none !important; } }";
            document.head.appendChild(style);

            window.print();
            setTimeout(function () {
              window.close();
            }, 10000); // give them 10 seconds to print, then close
          } else {
            window.print();
            window.close();
          }
        }
      </script>
    </div>
  </div>
</body>

</html>`

  return htmlcode

}

async function generateSalesInvoice({ saleInvoice, garage, isWithTax }) {
  const { setting } = await getAllSettings()
  const { invoice, type, to, from, productWithPrice, subTotal, remainingAmount, isPaid, date, discountAmount, labourCharges } = saleInvoice;
  const userAddress = await Address.findOne({ user: to?._id }).select("address")

  let gstTotal = productWithPrice.reduce(
    (sum, item) => sum + ((item.price * item.quantity * (item?.gst || 18)) / 100),
    0
  )
  let subtotal = isWithTax ? subTotal - labourCharges + discountAmount - gstTotal : subTotal - labourCharges + discountAmount
  let grandTotal = subTotal

  function calculateGST(price, quantity, gstRate) {
    let subtotal = (Number(price) * Number(quantity));
    let gstAmount = (subtotal * Number(gstRate)) / 100;
    let totalAmount = subtotal + gstAmount;

    return {
      subtotal: subtotal.toFixed(2),
      gstAmount: gstAmount.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
    };
  }
  let totalInWords = numberToWords.toWords(subtotal).toUpperCase() + " ONLY";
  let gstTotalInWords = numberToWords.toWords(gstTotal).toUpperCase() + " ONLY";
  const tableHead = isWithTax ? ` <tr class="text-center">
            <th style="width: 7%">Sr No.</th>
            <th style="width: 20%">Items</th>
            <th style="width: 10%">HSN Code</th>
            <th style="width: 8%">Qty</th>
            <th style="width: 12%">Rate (₹)</th>
            <th style="width: 8%">GST %</th>
            <th style="width: 12%">GST Amount</th>
            <th style="width: 11%">Total Amount</th>
          </tr>`
    : ` <tr class="text-center">
            <th style="width: 7%">Sr No.</th>
            <th style="width: 40%; text-align: left">Items</th>
            <th style="width: 8%">Qty</th>
            <th style="width: 15%; text-align: right">Rate (₹)</th>
            <th style="width: 15%; text-align: right">Amount</th>
          </tr>`

  let htmlcode = `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice</title>
  ${innerStyle}
</head>

<body>
    <div class="invoice-box">
      <table class="info-table border-1">
        <tbody>
          <tr class="bg-gray">
            <td width="90%" align="center">
              <h3 class="title fw-600">${garage?.name || 'N/A'}</h3>
            </td>
            <td class="text-right p-48 d-flex" width="10%">
              <img src="${process.env.Server_Img_Url}/images/logo.png" alt="" height="40" /><span
                class="fw-600"
                >SOWI</span
              >
            </td>
          </tr>
          <tr class="border-1">
            <td colspan="2" align="center">
              ${garage?.address || 'N/A'}
            </td>
          </tr>
          <tr class="border-1">
            <td colspan="2" align="center" class="heading">${isWithTax ? `SALE TAX INVOICE` : `SALE INVOICE`}</td>
          </tr>
        </tbody>
      </table>
      <table>
        <tbody>
          <tr
            style="
              border: 1px solid #000;
              border-top-width: 0;
              border-bottom-width: 0;
            "
          >
            <td class="p-0" width="50%">
              <table>
                <tbody>
                  <tr>
                    <td class="border-bottom-0" style="padding: 0 15px">
                      <strong class="fw-600">To :</strong>
                      <p>${to?.name || 'N/A'}</p>
                      <p>${to?.mobileNo || 'N/A'}</p>
                      <p>
                        ${userAddress?.address || 'N/A'}
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>

            <td class="p-0" width="50%" style="border-left: 1px solid #000">
              <table class="bg-gray" style="height: 60px">
                <tbody>
                  <tr>
                    <td class="border-bottom-0" style="padding: 0 15px">
                      <b>Invoice No :</b> <span>${invoice?.invoiceCode}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 15px">
                      <b>Date &amp; Time : </b><span>${new Date(invoice?.createdAt).toLocaleDateString()} ${new Date(invoice?.createdAt).toLocaleTimeString()}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
              <table>
                <tbody>
                  <tr>
                    <td
                      class="border-1 bg-gray"
                      style="
                        padding: 5px 15px;
                        border-left: 0;
                        border-right: 0;
                        border-bottom: 0;
                      "
                    >
                      <strong class="fw-600">From :</strong>
                      <p>${from?.name || 'N/A'} - <span>${from?.mobileNo || 'N/A'} </span></p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      <table class="invoice-table">
        <thead>
          ${tableHead}
        </thead>
        <tbody>
          ${productWithPrice.map((item, index) => `
              <tr class="remove-line text-center">
                <td>${index + 1}</td>
                <td>${item.productName || 'Unnamed Product'}</td>
                ${isWithTax && `<td>${item?.hsn || 12345678}</td>`}
                <td>${item.quantity}</td>
                <td class="text-right">${item.price}</td>
                ${isWithTax && `<td>${item?.gst || 18}%</td>`}
                ${isWithTax && `<td>${calculateGST(item.price, item.quantity, item?.gst || 18).gstAmount}</td>`}
                <td class="text-right">${(item.price * item.quantity)}</td>
              </tr>`).join('')}
          <tr>
            ${isWithTax ? `<td
              colspan="6"
              class="border-1 p-0"
              style="vertical-align: top; border-top-width: 0"
            >
              <table>
                <tbody>
                  <tr class="bg-gray" style="border-top: 1px solid #000">
                    <td height="20" colspan="6">
                      <p>GSTIN number : <span>${garage?.gstNo || 'N/A'}</span></p>
                    </td>
                  </tr>
                  <tr style="border-top: 1px solid #000">
                    <td colspan="6" height="30">
                      <p>bank name : <span> ${garage?.bankName || 'N/A'}</span></p>
              <p>bank account number : <span> ${garage?.accountNumber || 'N/A'}</span></p>
              <p>IFSC code : <span> ${garage?.ifsc || 'N/A'}</span></p>
                    </td>
                  </tr>
                  <tr style="border-top: 1px solid #000">
                    <td colspan="6">
                      <p style="margin-bottom: 12px">
                        total GST :
                        <span> ${gstTotalInWords}</span>
                      </p>
                      <p>bill amount : <span> ${totalInWords}</span></p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td> ` : `<td colspan="3" class="border-1" height="40">
             <p>bank name : <span> ${garage?.bankName || 'N/A'}</span></p>
              <p>bank account number : <span> ${garage?.accountNumber || 'N/A'}</span></p>
              <p>IFSC code : <span> ${garage?.ifsc || 'N/A'}</span></p>
            </td>`
    }
            <td colspan="2" class="p-0">
              <table>
                <tbody>
                  <tr style="border-top: 1px solid #000">
                    <td class="border-bottom-0" height="20">Net Amount</td>
                    <td class="text-right border-bottom-0">${subtotal}</td>
                  </tr>
                  ${isWithTax ? `<tr>
                    <td class="border-bottom-0" height="20">GST</td>
                    <td class="text-right border-bottom-0">${gstTotal}</td>
                  </tr>` : ''}
                  <tr>
                    <td class="border-bottom-0" height="20">Round Off</td>
                    <td class="text-right border-bottom-0">${discountAmount}</td>
                  </tr>
                  <tr>
                    <td class="border-bottom-0" height="20">
                      Additional Charge
                    </td>
                    <td class="text-right border-bottom-0">${labourCharges}</td>
                  </tr>
                  ${isWithTax ? `<tr class="bg-gray" style="border-top: 1px solid #000">
                    <td class="border-bottom-0 fw-600" height="30">
                      grand total
                    </td>
                    <td class="text-right border-bottom-0 fw-600">${grandTotal}</td>
                  </tr>` : ''}
                </tbody>
              </table>
            </td>
          </tr>
          ${!isWithTax ? `<tr>
            <td colspan="3">bill amount : ${totalInWords}</td>
            <td class="border-1 fw-600 bg-gray" height="25">grand total</td>
            <td class="text-right border-1 fw-600 bg-gray">${grandTotal}</td>
          </tr>` : ''}
        </tbody>
      </table>

      <table class="border-1" style="border-top-width: 0">
        <tbody>
          <tr>
            <td height="110">
              <h3 style="margin: 0; line-height: 20px; font-weight: 600">
                Terms &amp; Conditions
              </h3>
              <ul
                style="margin: 0; padding-left: 20px; list-style-type: decimal"
              >
                ${setting?.invoiceTerms}
              </ul>
            </td>
            <td height="110">
              <table>
                <tbody>
                  <tr>
                    <td
                      class="border-bottom-0 text-right"
                      height="50"
                      style="vertical-align: top"
                    >
                      <b class="fw-600">from : </b>
                      <span> ${garage?.name || 'N/A'}</span>
                    </td>
                  </tr>
                  <tr>
                    <td
                      colspan="2"
                      class="border-bottom-0 text-right fw-600"
                      style="vertical-align: bottom"
                    >
                      signature
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
          <tr>
            <td height="80" width="100%" align="center" colspan="2">
              <table class="blue-table border-1">
                <tbody>
                  <tr>
                    <td class="border-bottom-0">
                      <img
                        src="${process.env.Server_Img_Url}/images/logo.png"
                        alt="SOWI Logo"
                        style="height: 25px"
                      />
                    </td>
                    <td style="font-weight: bold; border: 0">
                      Invoice Created Using SOWI App
                    </td>
                    <td class="border-bottom-0">
                      <a
                        href="#"
                        style="margin-right: 8px; text-decoration: none"
                      >
                        <img
                          src="${process.env.Server_Img_Url}/images/playstore.png"
                          alt="Get it on Google Play"
                          style="height: 25px"
                        />
                      </a>
                      <a href="#">
                        <img
                          src="${process.env.Server_Img_Url}/images/appstore.png"
                          alt="Download on the App Store"
                          style="height: 25px"
                        />
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="col-xs-2">
        <form>
          <button
            type="button"
            value="Print this page"
            onclick="printpage();"
            class="btn btn-default print-hide"
          >
            <i class="fa fa-print"></i> Print
          </button>
        </form>
        <script>
          function printpage() {
            var is_chrome = function () {
              return Boolean(window.chrome);
            };
            if (is_chrome) {
              // Removing headers and footers for Chrome
              var style = document.createElement("style");
              style.type = "text/css";
              style.innerHTML =
                "@media print { @page { margin: 10px 0 0; } body { -webkit-print-color-adjust: exact; } .print-hide { display: none !important; } }";
              document.head.appendChild(style);

              window.print();
              setTimeout(function () {
                window.close();
              }, 10000); // give them 10 seconds to print, then close
            } else {
              window.print();
              window.close();
            }
          }
        </script>
      </div>
    </div>
  </body>



</html>`

  return htmlcode

}

async function generatePurchaseInvoice({ purchaseInvoice, garage, isWithTax }) {
  const { setting } = await getAllSettings()
  const { invoice, type, to, from, productWithPrice, subTotal, remainingAmount, isPaid, date, discountAmount, labourCharges, billNo } = purchaseInvoice;
  const userAddress = await Address.findOne({ user: to?._id }).select("address")

  let gstTotal = productWithPrice.reduce(
    (sum, item) => sum + ((item.price * item.quantity * (item?.gst || 18)) / 100),
    0
  )
  let subtotal = isWithTax ? subTotal - labourCharges + discountAmount - gstTotal : subTotal - labourCharges + discountAmount
  let grandTotal = subTotal

  function calculateGST(price, quantity, gstRate) {
    let subtotal = (Number(price) * Number(quantity));
    let gstAmount = (subtotal * Number(gstRate)) / 100;
    let totalAmount = subtotal + gstAmount;

    return {
      subtotal: subtotal.toFixed(2),
      gstAmount: gstAmount.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
    };
  }
  let totalInWords = numberToWords.toWords(subtotal).toUpperCase() + " ONLY";
  let gstTotalInWords = numberToWords.toWords(gstTotal).toUpperCase() + " ONLY";
  const tableHead = isWithTax ? ` <tr class="text-center">
            <th style="width: 7%">Sr No.</th>
            <th style="width: 20%">Items</th>
            <th style="width: 10%">HSN Code</th>
            <th style="width: 8%">Qty</th>
            <th style="width: 12%">Rate (₹)</th>
            <th style="width: 8%">GST %</th>
            <th style="width: 12%">GST Amount</th>
            <th style="width: 11%">Total Amount</th>
          </tr>`
    : ` <th style="width: 7%">Sr No.</th>
            <th style="width: 40%; text-align: left">Items</th>
            <th style="width: 8%">Qty</th>
            <th style="width: 15%; text-align: right">Rate (₹)</th>
            <th style="width: 15%; text-align: right">Amount</th>`

  let htmlcode = `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice</title>
  ${innerStyle}
</head>

<body>
    <div class="invoice-box">
      <table class="info-table border-1">
        <tbody>
          <tr class="bg-gray">
            <td width="90%" align="center">
              <h3 class="title fw-600">${garage?.name || 'N/A'}</h3>
            </td>
            <td class="text-right p-48 d-flex" width="10%">
              <img src="${process.env.Server_Img_Url}/images/logo.png" alt="" height="40" /><span
                class="fw-600"
                >SOWI</span
              >
            </td>
          </tr>
          <tr class="border-1">
            <td colspan="2" align="center">
              ${garage?.address || 'N/A'}
            </td>
          </tr>
          <tr class="border-1">
            <td colspan="2" align="center" class="heading">${isWithTax ? `purchase TAX INVOICE` : `purchase INVOICE`}</td>
          </tr>
        </tbody>
      </table>
      <table>
        <tbody>
          <tr
            style="
              border: 1px solid #000;
              border-top-width: 0;
              border-bottom-width: 0;
            "
          >
            <td class="p-0" width="50%">
              <table>
                <tbody>
                  <tr>
                    <td class="border-bottom-0" style="padding: 0 15px">
                      <strong class="fw-600">From :</strong>
                      <p>${from?.name || 'N/A'}</p>
                      <p>${from?.mobileNo || 'N/A'}</p>
                      <p>
                        ${garage?.address || 'N/A'}
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>

            <td class="p-0" width="50%" style="border-left: 1px solid #000">
              <table class="bg-gray" style="height: 60px">
                <tbody>
                  <tr>
                    <td class="border-bottom-0" style="padding: 0 15px">
                      <b>Invoice No :</b> <span>${invoice?.invoiceCode}</span>
                    </td>
                    <td class="border-bottom-0" style="padding: 0 15px">
                      <b>bill no :</b> <span>${billNo || 'N/A'}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 15px">
                      <b>Date &amp; Time : </b><span>${new Date(invoice?.createdAt).toLocaleDateString()} ${new Date(invoice?.createdAt).toLocaleTimeString()}</span>
                    </td>
                    <td class="border-bottom-0" style="padding: 0 15px">
                      <b>bill date :</b> <span>${date}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
              <table>
                <tbody>
                  <tr>
                    <td
                      class="border-1"
                      style="
                        padding: 5px 15px;
                        border-left: 0;
                        border-right: 0;
                        border-bottom: 0;
                      "
                    >
                      <strong class="fw-600">To :</strong>
                      <p>${to?.name || 'N/A'} - <span>${to?.mobileNo || 'N/A'} </span></p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      <table class="invoice-table">
        <thead>
          <tr class="text-center">
            ${tableHead}
          </tr>
        </thead>
        <tbody>
          ${productWithPrice.map((item, index) => `
              <tr class="remove-line text-center">
                <td>${index + 1}</td>
                <td>${item.productName || 'Unnamed Product'}</td>
                ${isWithTax && `<td>${item?.hsn || 12345678}</td>`}
                <td>${item.quantity}</td>
                <td class="text-right">${item.price}</td>
                ${isWithTax && `<td>${item?.gst || 18}%</td>`}
                ${isWithTax && `<td>${calculateGST(item.price, item.quantity, item?.gst || 18).gstAmount}</td>`}
                <td class="text-right">${(item.price * item.quantity)}</td>
              </tr>`).join('')}

          ${isWithTax ? `<tr>
            <td
              colspan="6"
              class="border-1 p-0"
              style="vertical-align: top; border-top-width: 0"
            >
              <table>
                <tbody>
                  <tr class="bg-gray" style="border-top: 1px solid #000">
                    <td height="20" colspan="6">
                      <p>GSTIN number : <span>${garage?.gstNo || 'N/A'}</span></p>
                    </td>
                  </tr>
                  <tr style="border-top: 1px solid #000">
                    <td colspan="6" height="65">
                      <p style="margin-bottom: 12px">
                        total GST :
                        <span> ${gstTotalInWords}</span>
                      </p>
                      <p>bill amount : <span> ${totalInWords}</span></p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
            <td colspan="2" class="p-0">
              <table>
                <tbody>
                  <tr style="border-top: 1px solid #000">
                    <td class="border-bottom-0" height="20">Net Amount</td>
                    <td class="text-right border-bottom-0">${subtotal}</td>
                  </tr>
                  <tr>
                    <td class="border-bottom-0" height="20">GST</td>
                    <td class="text-right border-bottom-0">${gstTotal}</td>
                  </tr>
                  <tr>
                    <td class="border-bottom-0" height="20">Round Off</td>
                    <td class="text-right border-bottom-0">${discountAmount}</td>
                  </tr>
                  <tr>
                    <td class="border-bottom-0" height="20">
                      Additional Charge
                    </td>
                    <td class="text-right border-bottom-0">${labourCharges}</td>
                  </tr>
                  <tr class="bg-gray" style="border-top: 1px solid #000">
                    <td class="border-bottom-0 fw-600" height="25">
                      grand total
                    </td>
                    <td class="text-right border-bottom-0 fw-600">${grandTotal}</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>` :
      `<tr>
            <td colspan="3" class="border-1">
              bill amount : ${totalInWords}
            </td>
            <td colspan="2" class="p-0">
              <table>
                <tbody>
                  <tr style="border-top: 1px solid #000">
                    <td class="border-bottom-0" height="20">Net Amount</td>
                    <td class="text-right border-bottom-0">${subtotal}</td>
                  </tr>
                  <tr>
                    <td class="border-bottom-0" height="20">Round Off</td>
                    <td class="text-right border-bottom-0">${discountAmount}</td>
                  </tr>
                  <tr>
                    <td class="border-bottom-0" height="20">
                      Additional Charge
                    </td>
                    <td class="text-right border-bottom-0">${labourCharges}</td>
                  </tr>
                  <tr class="bg-gray" style="border-top: 1px solid #000">
                    <td class="border-bottom-0 fw-600" height="25">
                      grand total
                    </td>
                    <td class="text-right border-bottom-0 fw-600">${grandTotal}</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>`}
        </tbody>
      </table>

      <table class="border-1" style="border-top-width: 0">
        <tbody>
          <tr>
            <td height="110">
              <h3 style="margin: 0; line-height: 20px; font-weight: 600">
                Terms &amp; Conditions
              </h3>
              <ul
                style="margin: 0; padding-left: 20px; list-style-type: decimal"
              >
                ${setting?.invoiceTerms}
              </ul>
            </td>
            <td height="110">
              <table>
                <tbody>
                  <tr>
                    <td
                      class="border-bottom-0 text-right"
                      height="50"
                      style="vertical-align: top"
                    >
                      <b class="fw-600">from : </b>
                      <span>${garage?.name || 'N/A'}</span>
                    </td>
                  </tr>
                  <tr>
                    <td
                      colspan="2"
                      class="border-bottom-0 text-right fw-600"
                      style="vertical-align: bottom"
                    >
                      signature
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
          <tr>
            <td height="80" width="100%" align="center" colspan="2">
              <table class="blue-table border-1">
                <tbody>
                  <tr>
                    <td class="border-bottom-0">
                      <img
                        src="${process.env.Server_Img_Url}/images/logo.png"
                        alt="SOWI Logo"
                        style="height: 25px"
                      />
                    </td>
                    <td style="font-weight: bold; border: 0">
                      Invoice Created Using SOWI App
                    </td>
                    <td class="border-bottom-0">
                      <a
                        href="#"
                        style="margin-right: 8px; text-decoration: none"
                      >
                        <img
                          src="${process.env.Server_Img_Url}/images/playstore.png"
                          alt="Get it on Google Play"
                          style="height: 25px"
                        />
                      </a>
                      <a href="#">
                        <img
                          src="${process.env.Server_Img_Url}/images/appstore.png"
                          alt="Download on the App Store"
                          style="height: 25px"
                        />
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="col-xs-2">
        <form>
          <button
            type="button"
            value="Print this page"
            onclick="printpage();"
            class="btn btn-default print-hide"
          >
            <i class="fa fa-print"></i> Print
          </button>
        </form>
        <script>
          function printpage() {
            var is_chrome = function () {
              return Boolean(window.chrome);
            };
            if (is_chrome) {
              // Removing headers and footers for Chrome
              var style = document.createElement("style");
              style.type = "text/css";
              style.innerHTML =
                "@media print { @page { margin: 10px 0 0; } body { -webkit-print-color-adjust: exact; } .print-hide { display: none !important; } }";
              document.head.appendChild(style);

              window.print();
              setTimeout(function () {
                window.close();
              }, 10000); // give them 10 seconds to print, then close
            } else {
              window.print();
              window.close();
            }
          }
        </script>
      </div>
    </div>
  </body>



</html>`

  return htmlcode

}

const generateInvoiceHTML = async (req, res) => {
  try {
    // Find the invoice by ID
    let { isWithTax } = req.query
    const vendorId = req?.user?.id
    const { id } = req.params;
    const invoice = await Invoice.findById(id).populate('from to');
    let saleInvoice, purchaseInvoice, booking;
    isWithTax = isWithTax === "true" ? true : ""
    const garage = await Garage.findOne({ vendor: vendorId })
    let htmlContent = ''

    if (invoice?.type === "1" || invoice?.type === "2" || invoice?.type === "3" || invoice?.type === "6") {
      saleInvoice = await SaleInvoice.findOne({ invoice: id }).populate('productWithPrice.productId to from invoice');
      htmlContent = await generateSalesInvoice({ saleInvoice, garage, isWithTax })
    } else if (invoice?.type === "4" || invoice?.type === "5") {
      purchaseInvoice = await PurchaseInvoice.findOne({ invoice: id }).populate('productWithPrice.productId to from invoice');
      htmlContent = await generatePurchaseInvoice({ purchaseInvoice, garage, isWithTax })
    } else if (invoice?.type === "0") {
      booking = await Booking.findOne({ invoice: id })
        .populate('user vendor myVehicle services pickupAddress dropAddress garage SubMechanic')
        .populate('invoice', 'invoiceCode')

      htmlContent = await generateBookingInvoice({ booking, garage, isWithTax })
    }

    if (!invoice) {
      return res.status(404).send("Invoice not found");
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
