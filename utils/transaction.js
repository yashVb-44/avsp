const Transaction = require("../models/transaction"); // Import the Transaction model
const Booking = require("../models/booking"); // Import the Booking model

const addTransaction = async ({
  ownerType,
  ownerId,
  amount,
  vendor,
  user,
  booking,
  transactionType,
  addOnAmount,
  isWithAddOnAmount,
}) => {
  try {
    let transaction;

    // Check if booking exists
    // const existingBooking = await Booking.findById(booking._id);
    // if (!existingBooking) {
    //   throw new Error("Booking not found");
    // }

    if (transactionType === "0") {
      transaction = new Transaction({
        ownerUser: ownerId,
        vendor,
        bookingId: booking._id,
        amount: booking.payableAmount,
        amountType: "0",
        remainingAmount: booking.payableAmount,
        transactionType,
      });
    } else if (transactionType === "1") {
      transaction = new Transaction({
        ownerUser: ownerId,
        vendor,
        amount: addOnAmount,
        amountType: "1",
        billingType: "2",
        transactionType,
        isWithAddOnAmount,
      });
    } else if (transactionType === "2") {
      transaction = new Transaction({
        ownerUser: ownerId,
        vendor,
        amount: amount,
        amountType: "1",
        transactionType,
        billingType: "2",
        isWithAddOnAmount,
        booking
      });
    } else {
      throw new Error("Invalid ownerType. Must be 0 for user or 1 for vendor.");
    }

    // Save the transaction to the database
    await transaction.save();

    return {
      success: true,
      message: "Transaction added successfully",
      transaction,
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Error adding transaction", error };
  }
};

const SaleAndPurchaseTransaction = async ({ note, paymentType, addOnAmount, customer, owner, amount, amountType, billingType, transactionType, subType, invoice, invoiceId, ownerModel, customerModel, isWithAddOnAmount, isDebitFromWallet, remainingAmount, totalAmount, transactions }) => {
  try {
    let newTransaction = await new Transaction({
      customer,
      owner,
      amount,
      amountType,
      billingType,
      transactionType,
      subType,
      invoice,
      customerModel,
      ownerModel,
      totalAmount,
      remainingAmount,
      isDebitFromWallet,
      isWithAddOnAmount,
      note,
      addOnAmount,
      paymentType,
      invoiceId,
      transactions
    });
    // if (subType === "1") {
    //   newTransaction.invoiceId = invoiceId
    // } else if (subType === "2") {
    //   newTransaction.invoiceId = invoiceId
    // } else if (subType === "3") {
    //   newTransaction.inovice = invoice
    // }
    await newTransaction.save()
    return newTransaction

  } catch (error) {
    throw new Error(`Transaction handling failed: ${error.message}`);
  }
};


const addTransactionAtAddNewUser = async ({
  transactionType,
  ownerId,
  amount,
  vendor,
}) => {
  try {
    let transaction;
    transaction = new Transaction({
      ownerUser: ownerId,
      vendor,
      amount: amount,
      amountType: "1",
      remainingAmount: 0,
      transactionType: transactionType,
    });
  } catch (error) {
    return { success: false, message: "Error adding transaction", error };
  }
};

const updateTransaction = async ({ bookingId, amount }) => {
  try {
    let transaction = await Transaction.findOne({ bookingId });
    if (transaction.remainingAmount === amount) {
      transaction.billingType = "1";
      transaction.remainingAmount = 0;
    }
    transaction.remainingAmount -= amount;
    transaction.save();
    // transaction = new Transaction({
    //   ownerUser: ownerId,
    //   vendor,
    //   amount: amount,
    //   amountType: "1",
    //   remainingAmount: 0,
    //   transactionType: transactionType,
    // });
  } catch (error) {
    return { success: false, message: "Error adding transaction", error };
  }
};

module.exports = {
  addTransaction,
  addTransactionAtAddNewUser,
  updateTransaction,
  SaleAndPurchaseTransaction
};
