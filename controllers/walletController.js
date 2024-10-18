const asyncHandler = require("express-async-handler");
const Wallet = require("../models/wallet"); // Import Wallet model
const User = require("../models/user"); // Import Wallet model
const Vendor = require("../models/vendor"); // Import Wallet model
const Booking = require("../models/booking"); // Import Booking model (for reference)
const SaleInvoice = require("../models/saleInvoice");
const { addTransactionAtAddNewUser, addTransaction, updateTransaction, SaleTransaction } = require("../utils/transaction");
const { checkUserWalletExistForVendor } = require("../utils/wallet");

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

const addUserWallet = asyncHandler(async (req, res) => {
  try {
    const vendor = req.user;
    const { transactions, totalAmount, userId, addOnAmount, walletAmount, isWithAddOnAmount, type, paymentType, note } = req.body;

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
      if (isWithAddOnAmount === "1") {
        wallet.amount += addOnAmount;
        wallet.virtualAmount += addOnAmount;
      } else {
        wallet.amount -= walletAmount;
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

    await SaleTransaction({ customer: userId, owner: vendor.id, invoice: transactions || [], transactionType: "0", subType: "3", amountType: "0", amount: walletAmount, totalAmount: totalAmount, addOnAmount: addOnAmount || 0, ownerModel: "Vendor", customerModel: "User", isDebitFromWallet: "1", isWithAddOnAmount: isWithAddOnAmount ? "1" : "0", note, paymentType })

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

const getAllParties = asyncHandler(async (req, res) => {
  try {
    const vendor = req.user;
    const searchQuery = req.query.search || ''; // Fetch the search query from request

    const wallets = await Wallet.find({ owner: vendor.id }).sort({ createdAt: -1 });

    // Find all wallet entries and populate customer information
    const parties = await Promise.all(wallets.map(async (wallet) => {
      let populatedWallet = wallet.toObject();
      if (wallet.customerModel === 'User') {
        populatedWallet.customer = await User.findOne({
          _id: wallet.customer,
          name: { $regex: searchQuery, $options: 'i' } // Search by name (case-insensitive)
        }).lean();
      } else if (wallet.customerModel === 'Vendor') {
        populatedWallet.customer = await Vendor.findOne({
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

    const wallets = await Wallet.find({ owner: vendor.id, customerModel: 'Vendor' }).sort({ createdAt: -1 });

    // Find all wallet entries for vendors and populate customer information
    const parties = await Promise.all(wallets.map(async (wallet) => {
      let populatedWallet = wallet.toObject();
      populatedWallet.customer = await Vendor.findOne({
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


// get user pending payments 
const getUserPendingPayments = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.userId; // Assuming you're passing user ID via params
    const vendorId = req.user.id

    // Find all unpaid bookings where the remaining amount is greater than 0
    const pendingBookings = await Booking.find({
      user: userId,
      isPaid: false,
      vendor: vendorId,
      // remainingAmount: { $gt: 0 }
    }).lean();
    // Find all unpaid sale invoices where the remaining amount is greater than 0
    const pendingSaleInvoices = await SaleInvoice.find({
      to: userId,
      toModel: 'User',
      isPaid: false,
      from: vendorId
      // remainingAmount: { $gt: 0 }
    }).lean();

    // Prepare the result combining both bookings and sale invoices
    const pendingPayments = [
      ...pendingBookings.map(booking => ({
        type: 'Booking',
        id: booking._id,
        remainingAmount: booking.remainingAmount,
        totalAmount: booking.payableAmount
        // details: booking,
      })),
      ...pendingSaleInvoices.map(invoice => ({
        type: 'SaleInvoice',
        id: invoice._id,
        remainingAmount: invoice.remainingAmount,
        totalAmount: invoice.subTotal
        // details: invoice,
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


module.exports = { addUserWallet, addNewUserParty, getAllParties, getUserPendingPayments, getUserParties, getVendorParties };
