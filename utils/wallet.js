const Wallet = require('../models/wallet'); // Import the Wallet model

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

        if (ownerModel === "User") {
            // For owner user by vendor (ownerType 0)
            wallet = await Wallet.findOne({ owner, ownerModel, customer });
            if (wallet) {
                // Update the virtualAmount based on amountType (1 = add, 0 = subtract)
                amountType === "1" ? wallet.virtualAmount += amount : wallet.virtualAmount -= amount;
            } else {
                // Create a new wallet if it doesn't exist
                wallet = new Wallet({
                    owner: owner,
                    ownerModel,
                    customerModel,
                    amount,
                    customer,
                    virtualAmount: amountType === "1" ? amount : -amount
                });
            }
        } else if (ownerType === "Vednor") {
            // For owner vendor by user (ownerType 1)
            wallet = await Wallet.findOne({ owner: owner, ownerModel, customer });
            if (wallet) {
                // Update the virtualAmount based on amountType (1 = add, 0 = subtract)
                amountType === "1" ? wallet.virtualAmount += amount : wallet.virtualAmount -= amount;
            } else {
                // Create a new wallet if it doesn't exist
                wallet = new Wallet({
                    owner: owner,
                    ownerModel,
                    customerModel,
                    customer,
                    amount,
                    virtualAmount: amountType === "1" ? amount : -amount
                });
            }
        } else {
            throw new Error("Invalid ownerType. Must be 0 for user or 1 for vendor.");
        }

        // Save the updated or newly created wallet entry
        await wallet.save();

        return { success: true, message: 'Wallet updated successfully', wallet };
    } catch (error) {
        console.error(error);
        return { success: false, message: 'Error updating wallet', error };
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


module.exports = { addRemoveAmountFromWallet, checkUserWalletExistForVendor }  