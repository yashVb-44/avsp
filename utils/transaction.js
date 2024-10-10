const Transaction = require('../models/transaction'); // Import the Transaction model
const Booking = require('../models/booking'); // Import the Booking model


const addTransaction = async ({ ownerType, ownerId, amount, vendor, user, booking }) => {
    try {
        let transaction;

        // Check if booking exists
        const existingBooking = await Booking.findById(booking._id);
        if (!existingBooking) {
            throw new Error('Booking not found');
        }

        // Create a new transaction object
        if (ownerType === "0") {
            transaction = new Transaction({
                ownerUser: ownerId,
                vendor,
                bookingId: booking.bookingId,
                amount: booking.payableAmount,
                amountType: "1",
                remainingAmount: booking.payableAmount,
                transactionType: "0"
            });
        } else {
            throw new Error('Invalid ownerType. Must be 0 for user or 1 for vendor.');
        }

        // Save the transaction to the database
        await transaction.save();

        return { success: true, message: 'Transaction added successfully', transaction };
    } catch (error) {
        console.error(error);
        return { success: false, message: 'Error adding transaction', error };
    }
};

module.exports = { addTransaction };
