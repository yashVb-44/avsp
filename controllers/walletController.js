const asyncHandler = require("express-async-handler");
const Wallet = require("../models/wallet"); // Import Wallet model
const Booking = require("../models/booking"); // Import Booking model (for reference)
const { geteUserId } = require("../utils/user");
const { addTransactionAtAddNewUser, addTransaction, updateTransaction } = require("../utils/transaction");

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

const addNewParty = asyncHandler(async (req, res) => {
  try {
    const vendor = req.user;
    const { name, mobileNo, amount } = req.body;

    const user = await geteUserId({ mobileNo });

    // If no wallet exists, create a new one for the user
    let wallet = new Wallet({
      name,
      ownerUser: user._id,
      amount: amount,
      virtualAmount: amount,
      vendor: vendor.id,
    });

    // Save the wallet
    await wallet.save();
    await addTransactionAtAddNewUser({
      transactionType: "1",
      amount: amount,
      ownerId: user._id,
      vendor: vendor.id,
    });
    return res.status(201).json({
      message: "party add successfully",
      type: "success",
      wallet,
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

module.exports = { addUserWallet, addNewParty, getAllParties };
