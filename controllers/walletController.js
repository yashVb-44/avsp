const asyncHandler = require('express-async-handler');
const Wallet = require('../models/wallet'); // Import Wallet model
const Booking = require('../models/booking'); // Import Booking model (for reference)

const addUserWallet = asyncHandler(async (req, res) => {
    try {
        const vendor = req.user;
        const { booking, totalAmount, userId } = req.body;

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
                        type: 'error'
                    });
                }

                // Update the booking's paidAmount
                existingBooking.paidAmount += bookingAmount;
                await existingBooking.save();

            }
        }

        // Now handle the wallet update for the user (ownerUser)
        let wallet = await Wallet.findOne({ ownerUser: userId, vendor: vendor.id });

        if (wallet) {
            // If the user already has a wallet, update the amount
            wallet.amount += totalAmount;
        } else {
            // If no wallet exists, create a new one for the user
            wallet = new Wallet({
                ownerUser: userId,
                amount: totalAmount,
                vendor: vendor.id
            });
        }

        // Save the wallet
        await wallet.save();

        return res.status(201).json({
            message: 'Wallet updated successfully',
            type: 'success',
            wallet,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Failed to update wallet',
            error: error.message,
            type: 'error',
        });
    }
});

module.exports = { addUserWallet };
