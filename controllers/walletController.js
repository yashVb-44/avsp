const asyncHandler = require("express-async-handler");
const Wallet = require("../models/wallet"); // Import Wallet model
const User = require("../models/user"); // Import Wallet model
const Booking = require("../models/booking"); // Import Booking model (for reference)
const { addTransactionAtAddNewUser, addTransaction, updateTransaction } = require("../utils/transaction");
const { checkUserWalletExistForVendor } = require("../utils/wallet");

const addUserWallet = asyncHandler(async (req, res) => {
  try {
    const vendor = req.user;
    const { booking, totalAmount, userId, addOnAmount, walletAmount, isWithAddOnAmount } = req.body;

    if (booking && booking.length > 0) {
      // If booking exists in the request body
      for (let i = 0; i < booking.length; i++) {
        const bookingEntry = booking[i];
        const { bookingId, amount: bookingAmount } = bookingEntry;

        // Validate and find the booking
        const existingBooking = await Booking.findById(bookingId);
        if (!existingBooking) {
          return res.status(400).json({
            message: `Invalid booking ID: ${bookingId}`,
            type: "error",
          });
        }

        // Update the booking's paidAmount
        existingBooking.paidAmount += bookingAmount;
        await updateTransaction({ bookingId, amount: bookingAmount })
        await existingBooking.save();
      }
    }
    // Now handle the wallet update for the user (ownerUser)
    let wallet = await Wallet.findOne({
      ownerUser: userId,
      vendor: vendor.id,
    });

    if (wallet) {
      if (isWithAddOnAmount === "1") {
        wallet.amount += addOnAmount;
        wallet.virtualAmount += addOnAmount;
      } else {
        wallet.amount -= walletAmount
      }
    } else {
      wallet = new Wallet({
        ownerUser: userId,
        amount: addOnAmount,
        virtualAmount: addOnAmount,
        vendor: vendor.id
      });
    }
    booking && booking.length > 0 ? await addTransaction({ ownerId: userId, vendor: vendor.id, isWithAddOnAmount, amount: isWithAddOnAmount === "1" ? addOnAmount : walletAmount, transactionType: "2", booking }) : addTransaction({ ownerId: userId, vendor: vendor.id, addOnAmount, transactionType: "1", isWithAddOnAmount })

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
    const userWallet = await checkUserWalletExistForVendor({ userID: user._id, vendorID: vendor.id });

    if (userWallet) {
      return res.status(400).json({
        message: "User (party) already exists for this vendor",
        type: "error",
      });
    }

    // If no wallet exists, create a new one for the user
    const wallet = new Wallet({
      name,
      ownerUser: user._id, // Owner is the user created/found
      vendor: vendor._id,   // Vendor for the wallet
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
    console.error(error);
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

    const parties = await Wallet.find({ vendor: vendor.id });

    return res.status(201).json({
      message: "all parties get successfully",
      type: "success",
      parties,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to get parties",
      error: error.message,
      type: "error",
    });
  }
});

module.exports = { addUserWallet, addNewUserParty, getAllParties };
