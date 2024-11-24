const Wallet = require('../models/wallet'); // Import the Wallet model
const User = require('../models/user');
const TempVendor = require('../models/tempVendor');

// const addRemoveAmountFromWallet = async ({ ownerType, amountType, ownerId, amount, vendor, user }) => {
//     // console.log("check", ownerType, amountType, ownerId, amount)
//     try {
//         let wallet;

//         if (ownerType === "0") {
//             // For owner user by vendor (ownerType 0)
//             wallet = await Wallet.findOne({ ownerUser: ownerId, vendor });
//             if (wallet) {
//                 // If wallet exists for user, update the amount
//                 // amountType === "1" ? wallet.amount += amount : wallet.amount -= amount;
//                 amountType === "1" ? wallet.virtualAmount += amount : wallet.virtualAmount -= amount;
//             } else {
//                 // If wallet does not exist, create a new one for the user
//                 wallet = new Wallet({
//                     ownerUser: ownerId,
//                     // amount: amountType === "1" ? amount : -amount,
//                     virtualAmount: amountType === "1" ? amount : -amount,
//                     vendor
//                 });
//             }
//         } else if (ownerType === "1") {
//             // For owner vendor by user (ownerType 1)
//             wallet = await Wallet.findOne({ ownerVendor: ownerId, user });
//             if (wallet) {
//                 // amountType === "1" ? wallet.amount += amount : wallet.amount -= amount;
//                 amountType === "1" ? wallet.virtualAmount += amount : wallet.virtualAmount -= amount;
//             } else {
//                 // If wallet does not exist, create a new one for the vendor
//                 wallet = new Wallet({
//                     ownerVendor: ownerId,
//                     // amount: amountType === "1" ? amount : -amount,
//                     virtualAmount: amountType === "1" ? amount : -amount,
//                     user
//                 });
//             }
//         } else {
//             throw new Error("Invalid ownerType. Must be 0 for user or 1 for vendor.");
//         }

//         // Save the updated or newly created wallet entry
//         await wallet.save();

//         return { success: true, message: 'Wallet updated successfully', wallet };
//     } catch (error) {
//         console.error(error);
//         return { success: false, message: 'Error updating wallet', error };
//     }
// };

const addRemoveAmountFromWallet = async ({ ownerModel, customerModel, amountType, owner, customer, amount }) => {
    try {
        let wallet;

        if (customerModel === "User") {
            // For owner user by vendor (ownerType 0)
            wallet = await Wallet.findOne({ owner, ownerModel, customer });
            if (wallet) {
                // Update the virtualAmount based on amountType (1 = add, 0 = subtract)
                amountType === "1" ? wallet.virtualAmount += amount : wallet.virtualAmount -= amount;
                amountType === "1" ? wallet.amount += amount : wallet.amount -= amount;
            } else {
                const user = await User.findById(customer)
                // Create a new wallet if it doesn't exist
                wallet = new Wallet({
                    owner,
                    ownerModel,
                    customerModel,
                    amount: amountType === "1" ? amount : -amount,
                    customer,
                    virtualAmount: amountType === "1" ? amount : -amount,
                    name: user.name
                });
            }
        } else if (customerModel === "TempVendor") {
            // For owner vendor by user (ownerType 1)
            wallet = await Wallet.findOne({ owner, ownerModel, customer });
            if (wallet) {
                // Update the virtualAmount based on amountType (1 = add, 0 = subtract)
                amountType === "1" ? wallet.virtualAmount += amount : wallet.virtualAmount -= amount;
                amountType === "1" ? wallet.amount += amount : wallet.amount -= amount;
            } else {
                const tempVendor = await TempVendor.findById(customer)
                // Create a new wallet if it doesn't exist+
                wallet = new Wallet({
                    owner,
                    ownerModel,
                    customerModel,
                    customer,
                    amount: amountType === "1" ? amount : -amount,
                    virtualAmount: amountType === "1" ? amount : -amount,
                    name: tempVendor.name
                });
            }
        } else {
            wallet = await Wallet.findOne({ owner, ownerModel });
        }

        // Save the updated or newly created wallet entry
        await wallet.save();

        return { success: true, message: 'Wallet updated successfully', wallet };
    } catch (error) {
        console.error(error);
        return { success: false, message: 'Error updating wallet', error };
    }
};

const getCustmoreWalletBalance = async ({ customerId, ownerID }) => {
    try {
        const walletBalance = await Wallet.findOne({ customer: customerId, owner: ownerID })
        if (walletBalance) {
            return {
                isWallet: true,
                walletBalance: walletBalance.amount
            }
        }
        else {
            return {
                isWallet: false
            }
        }
    } catch (error) {
        return {
            isWallet: false
        }
    }
}

const processWalletAndTransaction = async ({ to, vendor, subTotal }) => {
    try {
        // Get the customer wallet balance and check if the wallet exists
        const { isWallet, walletBalance } = await getCustmoreWalletBalance({ customerId: to, ownerID: vendor.id });
        let remainingAmount = subTotal; // Initialize remaining amount as the subtotal
        let walletDebit = 0; // Initialize the wallet debit amount
        let isWalletDebit = false
        let isTottalyPaid = false
        if (isWallet) {
            // Scenario 1: Wallet has a positive balance
            if (walletBalance > 0) {
                if (walletBalance >= subTotal) {
                    // Scenario 4: Wallet balance is greater than or equal to subtotal
                    walletDebit = subTotal;
                    remainingAmount = 0;
                    isWalletDebit = true
                    isTottalyPaid = true
                } else {
                    // Scenario 1: Wallet balance is less than the subtotal
                    walletDebit = walletBalance;
                    remainingAmount = subTotal - walletBalance;
                    isWalletDebit = true
                }
            } else if (walletBalance < 0) {
                // Scenario 3: Wallet has a negative balance, ignore wallet and keep remaining as subtotal
                walletDebit = 0;
                remainingAmount = subTotal;
            }
        } else {
            // Scenario 2: No wallet, so remaining is the subtotal
            walletDebit = 0;
            remainingAmount = subTotal;
        }

        return { walletDebit, remainingAmount, isWalletDebit, isTottalyPaid, walletBalance };
    } catch (error) {
        console.error("Error processing wallet and transaction:", error);
        throw new Error("Failed to process wallet and transaction");
    }
};

const processWalletAndTransactionForVendor = async ({ to, vendor, subTotal }) => {
    try {
        // Get the customer wallet balance and check if the wallet exists
        const { isWallet, walletBalance } = await getCustmoreWalletBalance({ customerId: to, ownerID: vendor.id });
        let remainingAmount = subTotal; // Initialize remaining amount as the subtotal   
        let walletDebit = 0; // Initialize the wallet debit amount
        let isTottalyPaid = false
        if (isWallet) {
            if (walletBalance < 0) {
                if (subTotal <= Math.abs(walletBalance)) {
                    walletDebit = subTotal;
                    remainingAmount = 0;
                    isTottalyPaid = true
                } else {
                    walletDebit = Math.abs(walletBalance);
                    remainingAmount = subTotal - Math.abs(walletBalance);
                }
            } else if (walletBalance >= 0) {
                walletDebit = 0;
                remainingAmount = subTotal;
            }
        } else {
            walletDebit = 0;
            remainingAmount = subTotal;
        }

        return { walletDebit, remainingAmount, isTottalyPaid, walletBalance };
    } catch (error) {
        console.error("Error processing wallet and transaction:", error);
        throw new Error("Failed to process wallet and transaction");
    }
};

const checkUserWalletExistForVendor = async ({ customerID, ownerID }) => {
    try {
        const wallet = await Wallet.findOne({ customer: customerID, owner: ownerID });
        return wallet ? true : false;
    } catch (error) {
        throw new Error("Failed to check wallet existence.");
    }
};


module.exports = { addRemoveAmountFromWallet, checkUserWalletExistForVendor, getCustmoreWalletBalance, processWalletAndTransaction, processWalletAndTransactionForVendor }  