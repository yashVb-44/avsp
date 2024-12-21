const asyncHandler = require("express-async-handler");
const Wallet = require("../models/wallet"); // Import Wallet model
const User = require("../models/user"); // Import Wallet model
const Vendor = require("../models/vendor"); // Import Wallet model
const TempVendor = require("../models/tempVendor"); // Import Wallet model
const Booking = require("../models/booking"); // Import Booking model (for reference)
const SaleInvoice = require("../models/saleInvoice");
const { addTransactionAtAddNewUser, addTransaction, updateTransaction, SaleAndPurchaseTransaction } = require("../utils/transaction");
const { checkUserWalletExistForVendor } = require("../utils/wallet");
const PurchaseInvoice = require("../models/purchaseInvoice");
const { default: mongoose } = require("mongoose");
const expressAsyncHandler = require("express-async-handler");

// const addUserWallet = asyncHandler(async (req, res) => {
//   try {
//     const vendor = req.user;
//     const { booking, totalAmount, userId, addOnAmount, walletAmount, isWithAddOnAmount, type } = req.body;

//     if (booking && booking.length > 0) {
//       // If booking exists in the request body
//       for (let i = 0; i < booking.length; i++) {
//         const bookingEntry = booking[i];
//         const { bookingId, amount: bookingAmount } = bookingEntry;

//         // Validate and find the booking
//         const existingBooking = await Booking.findById(bookingId);
//         if (!existingBooking) {
//           return res.status(400).json({
//             message: `Invalid booking ID: ${bookingId}`,
//             type: "error",
//           });
//         }

//         // Update the booking's paidAmount
//         existingBooking.paidAmount += bookingAmount;
//         await updateTransaction({ bookingId, amount: bookingAmount })
//         await existingBooking.save();
//       }
//     }
//     // Now handle the wallet update for the user (ownerUser)
//     let wallet = await Wallet.findOne({
//       ownerUser: userId,
//       vendor: vendor.id,
//     });

//     if (wallet) {
//       if (isWithAddOnAmount === "1") {
//         wallet.amount += addOnAmount;
//         wallet.virtualAmount += addOnAmount;
//       } else {
//         wallet.amount -= walletAmount
//       }
//     } else {
//       wallet = new Wallet({
//         ownerUser: userId,
//         amount: addOnAmount,
//         virtualAmount: addOnAmount,
//         vendor: vendor.id
//       });
//     }
//     // booking && booking.length > 0 ? await addTransaction({ ownerId: userId, vendor: vendor.id, isWithAddOnAmount, amount: isWithAddOnAmount === "1" ? addOnAmount : walletAmount, transactionType: "2", booking }) : addTransaction({ ownerId: userId, vendor: vendor.id, addOnAmount, transactionType: "1", isWithAddOnAmount })

//     // Save the wallet
//     await wallet.save();

//     return res.status(201).json({
//       message: "Wallet updated successfully",
//       type: "success",
//       wallet,
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       message: "Failed to update wallet",
//       error: error.message,
//       type: "error",
//     });
//   }
// });

// payment in and out from the sale
const addUserWallet = asyncHandler(async (req, res) => {
  try {
    const vendor = req.user;
    const { transactions, totalAmount, userId, addOnAmount, walletAmount, isWithAddOnAmount, remainingAmount, type, paymentType, note } = req.body;

    if (transactions && transactions.length > 0) {
      // Loop through transactions which can include bookings or sale invoices
      for (let i = 0; i < transactions.length; i++) {
        const transactionEntry = transactions[i];
        const { id: transactionId, amount: transactionAmount, transactionType, remainingAmount } = transactionEntry;

        // Check whether the transaction is a booking or sale invoice
        const transactionModel = transactionType === "Booking" ? Booking : SaleInvoice;
        const existingTransaction = await transactionModel.findById(transactionId);

        if (!existingTransaction) {
          return res.status(400).json({
            message: `Invalid transaction ID: ${transactionId}`,
            type: "error",
          });
        }

        // Update paidAmount for bookings or sale invoices
        existingTransaction.paidAmount += transactionAmount;
        existingTransaction.remainingAmount = remainingAmount
        if (remainingAmount === 0) {
          existingTransaction.isPaid = true
        }
        // await updateTransaction({ transactionId, amount: transactionAmount });
        await existingTransaction.save();
      }
    }

    // Now handle wallet update for the user
    let wallet = await Wallet.findOne({
      customer: userId,
      owner: vendor.id,
    });

    if (wallet) {
      if (type === "1") {
        wallet.amount -= addOnAmount,
          wallet.virtualAmount -= addOnAmount
      }
      else {
        if (isWithAddOnAmount === "1") {
          wallet.amount += addOnAmount;
          wallet.virtualAmount += addOnAmount;
        } else {
          wallet.amount -= walletAmount;
        }
      }
    } else {
      wallet = new Wallet({
        customer: userId,
        customerModel: "User",
        ownerModel: "Vendor",
        amount: addOnAmount,
        virtualAmount: addOnAmount,
        owner: vendor.id,
      });
    }

    if (type === "1") {
      await SaleAndPurchaseTransaction({ customer: userId, owner: vendor.id, transactionType: "0", subType: "4", amountType: "2", amount: addOnAmount, totalAmount: totalAmount, remainingAmount, ownerModel: "Vendor", customerModel: "User", isDebitFromWallet: "1", note, paymentType })
    } else {
      await SaleAndPurchaseTransaction({ customer: userId, owner: vendor.id, invoice: transactions || [], transactionType: "0", subType: "3", amountType: "1", amount: walletAmount, totalAmount: totalAmount, addOnAmount: addOnAmount || 0, ownerModel: "Vendor", customerModel: "User", isDebitFromWallet: "1", isWithAddOnAmount: isWithAddOnAmount ? "1" : "0", note, paymentType, transactions })
    }

    // Save the wallet
    await wallet.save();

    return res.status(201).json({
      message: "Wallet updated successfully",
      type: "success",
      wallet,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to update wallet",
      error: error.message,
      type: "error",
    });
  }
});

const addVendorWallet = asyncHandler(async (req, res) => {
  try {
    const vendor = req.user;
    const { transactions, totalAmount, vendorId, addOnAmount, isWithAddOnAmount, remainingAmount, type, paymentType, note } = req.body;

    if (transactions && transactions.length > 0) {
      // Loop through transactions which can include purchase invoices
      for (let i = 0; i < transactions.length; i++) {
        const transactionEntry = transactions[i];
        const { id: transactionId, amount: transactionAmount, transactionType, remainingAmount } = transactionEntry;

        // Check whether the transaction is a booking or sale invoice
        const transactionModel = PurchaseInvoice;
        const existingTransaction = await transactionModel.findById(transactionId);

        if (!existingTransaction) {
          return res.status(400).json({
            message: `Invalid transaction ID: ${transactionId}`,
            type: "error",
          });
        }

        // Update paidAmount for purchase invoice
        existingTransaction.paidAmount += transactionAmount;
        existingTransaction.remainingAmount = remainingAmount
        if (remainingAmount === 0) {
          existingTransaction.isPaid = true
        }
        // await updateTransaction({ transactionId, amount: transactionAmount });
        await existingTransaction.save();
      }
    }

    // Now handle wallet update for the user
    let wallet = await Wallet.findOne({
      customer: vendorId,
      owner: vendor.id,
    });

    if (wallet) {
      if (type === "1") {
        wallet.amount -= addOnAmount,
          wallet.virtualAmount -= addOnAmount
      }
      else {
        if (isWithAddOnAmount === "1") {
          wallet.amount += addOnAmount;
          wallet.virtualAmount += addOnAmount;
        } else {
          wallet.amount -= walletAmount;
        }
      }
    } else {
      wallet = new Wallet({
        customer: vendorId,
        customerModel: "TempVendor",
        ownerModel: "Vendor",
        amount: addOnAmount,
        virtualAmount: addOnAmount,
        owner: vendor.id,
      });
    }

    if (type === "0") {
      await SaleAndPurchaseTransaction({ customer: vendorId, owner: vendor.id, transactionType: "1", subType: "3", amountType: "1", amount: addOnAmount, totalAmount: totalAmount, remainingAmount, ownerModel: "Vendor", customerModel: "TempVendor", note, paymentType, transactions })
    } else {
      await SaleAndPurchaseTransaction({ customer: vendorId, owner: vendor.id, invoice: transactions || [], transactionType: "1", subType: "4", amountType: "2", amount: addOnAmount, totalAmount: totalAmount, addOnAmount: addOnAmount || 0, ownerModel: "Vendor", customerModel: "TempVendor", isWithAddOnAmount: "1", note, paymentType, remainingAmount, transactions })
    }

    // Save the wallet
    await wallet.save();

    return res.status(201).json({
      message: "Wallet updated successfully",
      type: "success",
      wallet,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to update wallet",
      error: error.message,
      type: "error",
    });
  }
});

// add new user party
const addNewUserParty = asyncHandler(async (req, res) => {
  try {
    const vendor = req.user; // Vendor is fetched from authenticated request
    const { name, mobileNo } = req.body;

    // Check if the user already exists by mobile number
    let user = await User.findOne({ mobileNo });

    if (!user) {
      // If the user doesn't exist, create a new user
      user = new User({
        name,
        mobileNo,
        isVerified: true, // Set default verification status
        isActive: true,
      });

      // Save the newly created user
      await user.save();
    }

    // Check if the wallet exists for the user with the vendor
    const userWallet = await checkUserWalletExistForVendor({ customerID: user._id, ownerID: vendor.id });

    if (userWallet) {
      return res.status(400).json({
        message: "User (party) already exists for this vendor",
        type: "error",
      });
    }

    // If no wallet exists, create a new one for the user
    const wallet = new Wallet({
      ...req.body,
      name,
      ownerModel: "Vendor",
      customerModel: "User",
      customer: user._id, // Owner is the user created/found
      owner: vendor.id,   // Vendor for the wallet
      amount: 0,            // Initial amount is 0
      virtualAmount: 0,
    });

    // Save the wallet
    await wallet.save();;

    // Return a success response
    return res.status(201).json({
      message: "Party added successfully",
      type: "success",
      userId: user._id
    });
  } catch (error) {
    // console.error(error);
    return res.status(500).json({
      message: "Failed to add party",
      error: error.message,
      type: "error",
    });
  }
});

// add new vendor party
const addNewVendorParty = asyncHandler(async (req, res) => {
  try {
    const vendor = req.user; // Vendor is fetched from authenticated request
    const { name, mobileNo } = req.body;

    // Check if the TempVendor already exists by mobile number
    let tempVendor = await TempVendor.findOne({ mobileNo });

    if (!tempVendor) {
      // If the TempVendor doesn't exist, create a new TempVendor
      tempVendor = new TempVendor({
        ...req.body
      });

      // Save the newly created temp vendor
      await tempVendor.save();
    }

    // Check if the wallet exists for the vendor with the vendor
    const vendorWallet = await checkUserWalletExistForVendor({ customerID: tempVendor._id, ownerID: vendor.id });

    if (vendorWallet) {
      return res.status(400).json({
        message: "Party already exists for this vendor",
        type: "error",
      });
    }

    // If no wallet exists, create a new one for the user
    const wallet = new Wallet({
      ...req.body,
      name,
      ownerModel: "Vendor",
      customerModel: "TempVendor",
      customer: tempVendor._id, // Owner is the user created/found
      owner: vendor.id,   // Vendor for the wallet
      amount: 0,            // Initial amount is 0
      virtualAmount: 0,
    });

    // Save the wallet
    await wallet.save();

    // Return a success response
    return res.status(201).json({
      message: "Party added successfully",
      type: "success",
      vendorId: tempVendor._id
    });
  } catch (error) {
    // console.error(error);
    return res.status(500).json({
      message: "Failed to add party",
      error: error.message,
      type: "error",
    });
  }
});

const updateParty = async (req, res) => {
  try {
    const vendor = req.user;
    const { id } = req.params;
    const updates = req.body;

    // Find the wallet by ID
    let wallet = await Wallet.findOne({ customer: id, owner: vendor.id });
    if (!wallet) {
      return res.status(404).json({
        message: "Party not found",
        type: "error",
      });
    }

    if (updates.customerModel === "TempVendor") {
      const tempVendor = await TempVendor.findById(id)
      const { name, ...otherUpdates } = updates;
      Object.assign(tempVendor, otherUpdates)
      await tempVendor.save()
    }

    // Update only the provided fields
    Object.assign(wallet, updates);
    await wallet.save();

    return res.status(200).json({
      message: "party updated successfully",
      type: "success",
      wallet
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};

// const getAllParties = asyncHandler(async (req, res) => {
//   try {
//     const vendor = req.user;
//     const searchQuery = req.query.search || ''; // Fetch the search query from request

//     const wallets = await Wallet.find({ owner: vendor.id }).sort({ createdAt: -1 });

//     // Find all wallet entries and populate customer information
//     const parties = await Promise.all(wallets.map(async (wallet) => {
//       let populatedWallet = wallet.toObject();
//       if (wallet.customerModel === 'User') {
//         populatedWallet.customer = await User.findOne({
//           _id: wallet.customer,
//           name: { $regex: searchQuery, $options: 'i' } // Search by name (case-insensitive)
//         }).lean();
//       } else if (wallet.customerModel === 'TempVendor') {
//         populatedWallet.customer = await TempVendor.findOne({
//           _id: wallet.customer,
//           name: { $regex: searchQuery, $options: 'i' } // Search by name (case-insensitive)
//         }).lean();
//       }
//       return populatedWallet;
//     }));

//     // Filter out wallets where the customer could not be found (null)
//     const filteredParties = parties.filter(party => party.customer);

//     return res.status(200).json({
//       message: "All parties retrieved successfully",
//       type: "success",
//       parties: filteredParties,
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       message: "Failed to retrieve parties",
//       error: error.message,
//       type: "error",
//     });
//   }
// });

const getAllParties = asyncHandler(async (req, res) => {
  try {
    const vendor = req.user;
    const searchQuery = req.query.search || '';
    const type = req.query.type || '0'; // Default to '0' for all parties if type is not provided

    const wallets = await Wallet.find({ owner: vendor.id }).sort({ createdAt: -1 });

    // Filter wallets based on type: 0 = all, 1 = only users, 2 = only vendors
    const filteredWallets = wallets.filter(wallet => {
      if (type === '1') return wallet.customerModel === 'User';
      if (type === '2') return wallet.customerModel === 'TempVendor';
      return true; // '0' means include all parties
    });

    // Populate customer information based on customerModel
    const parties = await Promise.all(filteredWallets.map(async (wallet) => {
      let populatedWallet = wallet.toObject();
      if (wallet.customerModel === 'User') {
        populatedWallet.customer = await User.findOne({
          _id: wallet.customer,
          name: { $regex: searchQuery, $options: 'i' } // Search by name (case-insensitive)
        }).lean();
      } else if (wallet.customerModel === 'TempVendor') {
        populatedWallet.customer = await TempVendor.findOne({
          _id: wallet.customer,
          name: { $regex: searchQuery, $options: 'i' } // Search by name (case-insensitive)
        }).lean();
      }
      return populatedWallet;
    }));

    // Filter out wallets where the customer could not be found (null)
    const filteredParties = parties.filter(party => party.customer);

    return res.status(200).json({
      message: "All parties retrieved successfully",
      type: "success",
      parties: filteredParties,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to retrieve parties",
      error: error.message,
      type: "error",
    });
  }
});

const getUserParties = asyncHandler(async (req, res) => {
  try {
    const vendor = req.user;
    const searchQuery = req.query.search || ''; // Fetch the search query from request

    const wallets = await Wallet.find({ owner: vendor.id, customerModel: 'User' }).sort({ createdAt: -1 });

    // Find all wallet entries for users and populate customer information
    const parties = await Promise.all(wallets.map(async (wallet) => {
      let populatedWallet = wallet.toObject();
      populatedWallet.customer = await User.findOne({
        _id: wallet.customer,
        name: { $regex: searchQuery, $options: 'i' } // Search by name (case-insensitive)
      }).lean();
      return populatedWallet;
    }));

    // Filter out wallets where the customer could not be found (null)
    const filteredParties = parties.filter(party => party.customer);

    return res.status(200).json({
      message: "User parties retrieved successfully",
      type: "success",
      parties: filteredParties,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to retrieve user parties",
      error: error.message,
      type: "error",
    });
  }
});

const getVendorParties = asyncHandler(async (req, res) => {
  try {
    const vendor = req.user;
    const searchQuery = req.query.search || ''; // Fetch the search query from request

    const wallets = await Wallet.find({ owner: vendor.id, customerModel: 'TempVendor' }).sort({ createdAt: -1 });

    // Find all wallet entries for vendors and populate customer information
    const parties = await Promise.all(wallets.map(async (wallet) => {
      let populatedWallet = wallet.toObject();
      populatedWallet.customer = await TempVendor.findOne({
        _id: wallet.customer,
        name: { $regex: searchQuery, $options: 'i' } // Search by name (case-insensitive)
      }).lean();
      return populatedWallet;
    }));

    // Filter out wallets where the customer could not be found (null)
    const filteredParties = parties.filter(party => party.customer);

    return res.status(200).json({
      message: "Vendor parties retrieved successfully",
      type: "success",
      parties: filteredParties,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to retrieve vendor parties",
      error: error.message,
      type: "error",
    });
  }
});

// Controller to get the wallet lists based on type and subType from req.body
const getWalletListByType = async (req, res) => {
  try {
    const vendorId = req.user.id
    const { type, subType } = req.body;

    let customerModel, amountCondition;

    // Determine customerModel based on type (0 = sale, 1 = purchase)
    if (type === "0") {
      customerModel = 'User';
    } else if (type === "1") {
      customerModel = 'TempVendor';
    } else {
      return res.status(400).json({
        message: 'Invalid type provided. Type must be 0 (Sale) or 1 (Purchase).',
        type: "error",
      }
      );
    }

    // Determine amount condition based on subType (0 = less than 0, 1 = greater than 0)
    if (subType === "0") {
      amountCondition = { $lt: "0" };  // Amount less than 0
    } else if (subType === "1") {
      amountCondition = { $gt: "0" };  // Amount greater than 0
    } else {
      return res.status(400).json({
        message: 'Invalid subType provided. SubType must be 0 (less than) or 1 (greater than).',
        type: "error",
      });
    }

    // Fetch wallets based on the ownerModel and amount condition
    const walletList = await Wallet.find({
      customerModel: customerModel,
      amount: amountCondition,
      owner: vendorId
    });

    // Send response with the filtered wallet list
    res.status(200).json({
      message: "parties retrieved successfully",
      type: "success",
      walletList
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// get user pending payments 
const getUserPendingPayments = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.userId; // Assuming you're passing user ID via params
    const vendorId = req.user.id
    const { type } = req.query
    // Find all unpaid bookings where the remaining amount is greater than 0
    const pendingBookings = await Booking.find({
      user: userId,
      isPaid: false,
      vendor: vendorId,
      // remainingAmount: { $gt: 0 }
    }).populate('invoice').lean();
    // Find all unpaid sale invoices where the remaining amount is greater than 0
    const pendingSaleInvoices = await SaleInvoice.find({
      to: userId,
      toModel: 'User',
      isPaid: false,
      from: vendorId,
      type
      // remainingAmount: { $gt: 0 }
    }).populate('invoice').lean();
    // Prepare the result combining both bookings and sale invoices
    const pendingPayments = [
      ...(type === "0" ? pendingBookings.map(booking => ({
        type: 'Booking',
        id: booking._id,
        remainingAmount: booking.remainingAmount,
        totalAmount: booking.payableAmount,
        details: booking,
      })) : []),
      ...pendingSaleInvoices.map(invoice => ({
        type: 'SaleInvoice',
        id: invoice._id,
        remainingAmount: invoice.remainingAmount,
        totalAmount: invoice.subTotal,
        details: invoice,
      })),
    ];
    return res.status(200).json({
      message: "Pending payments retrieved successfully",
      type: "success",
      pendingPayments,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to retrieve pending payments",
      error: error.message,
      type: "error",
    });
  }
});

// get vendor pending payments 
const getVendorPendingPayments = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.userId; // Assuming you're passing user ID via params
    const vendorId = req.user.id
    const { type } = req.query
    // Find all unpaid purchase invoices where the remaining amount is greater than 0
    const pendingInvoiceInvoices = await PurchaseInvoice.find({
      to: userId,
      toModel: 'TempVendor',
      isPaid: false,
      from: vendorId,
      type
      // remainingAmount: { $gt: 0 }
    }).populate('invoice').lean();

    // Prepare the result of purchase invoices
    const pendingPayments = [
      ...pendingInvoiceInvoices.map(invoice => ({
        type: 'PurchaseInvoice',
        id: invoice._id,
        remainingAmount: invoice.remainingAmount,
        totalAmount: invoice.subTotal,
        details: invoice,
      })),
    ];

    return res.status(200).json({
      message: "Pending payments retrieved successfully",
      type: "success",
      pendingPayments,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to retrieve pending payments",
      error: error.message,
      type: "error",
    });
  }
});

const getWalletToPayAndToCollect = async (req, res) => {
  try {
    const vendorId = req.user.id;  // Assuming req.user contains the authenticated vendor's info

    // Fetch wallets where amount is less than 0 (to pay), filtered by owner (vendor)
    const toPayResult = await Wallet.aggregate([
      { $match: { owner: new mongoose.Types.ObjectId(vendorId), amount: { $gt: 0 } } },
      { $group: { _id: null, totalToPay: { $sum: "$amount" } } }
    ]);

    // Fetch wallets where amount is greater than 0 (to collect), filtered by owner (vendor)
    const toCollectResult = await Wallet.aggregate([
      { $match: { owner: new mongoose.Types.ObjectId(vendorId), amount: { $lt: 0 } } },
      { $group: { _id: null, totalToCollect: { $sum: "$amount" } } }
    ]);

    // Extract the results from the aggregation queries
    // const totalToPay = toPayResult.length > 0 ? Math.abs(toPayResult[0].totalToPay) : 0;  // Make totalToPay positive
    // const totalToCollect = toCollectResult.length > 0 ? toCollectResult[0].totalToCollect : 0;

    const totalToPay = toPayResult.length > 0 ? toPayResult[0].totalToPay : 0;
    const totalToCollect = toCollectResult.length > 0 ? Math.abs(toCollectResult[0].totalToCollect) : 0;

    // Send response with both amounts
    res.status(200).json({
      message: "Amounts calculated successfully",
      type: "success",
      totalToPay,
      totalToCollect,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', type: "error" });
  }
};

const getPartyDetails = asyncHandler(async (req, res) => {
  try {
    const vendor = req.user; // Vendor is assumed to be authenticated and available in req.user
    const customerId = req.params.customerId; // Customer ID to fetch

    // Find the wallet entry based on vendor (owner) and customer ID
    const wallet = await Wallet.findOne({ owner: vendor.id, customer: customerId });
    if (!wallet) {
      return res.status(404).json({
        message: "Wallet for this customer not found under the vendor",
        type: "error",
      });
    }

    let customerDetails;

    // Fetch the relevant customer details based on customerModel in wallet
    if (wallet.customerModel === 'User') {
      customerDetails = await User.findById(wallet.customer).select('-password -otp -otpExpiresAt'); // Exclude sensitive fields
    } else if (wallet.customerModel === 'TempVendor') {
      customerDetails = await TempVendor.findById(wallet.customer);
    }

    if (!customerDetails) {
      return res.status(404).json({
        message: "Customer details not found",
        type: "error",
      });
    }

    // Prepare response with wallet and customer details
    const partyDetails = {
      wallet: wallet.toObject(),
      customer: customerDetails.toObject()
    };

    return res.status(200).json({
      message: "Party details retrieved successfully",
      type: "success",
      partyDetails,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to retrieve party details",
      error: error.message,
      type: "error",
    });
  }
});

module.exports = { addUserWallet, addNewUserParty, getAllParties, getUserPendingPayments, getUserParties, getVendorParties, addNewVendorParty, addVendorWallet, getVendorPendingPayments, getWalletListByType, getWalletToPayAndToCollect, getPartyDetails, updateParty };
