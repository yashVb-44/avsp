const asyncHandler = require('express-async-handler');
const PurchaseInvoice = require('../models/purchaseInvoice');
const { SaleAndPurchaseTransaction } = require('../utils/transaction');
const { generateInvoiceCode } = require('../utils/invoice');
const { addRemoveAmountFromWallet, getCustmoreWalletBalance, processWalletAndTransaction, processWalletAndTransactionForVendor } = require('../utils/wallet');
const { updateProductStock } = require('../utils/product');

// Add PurchaseInvoice
const addPurchaseInvoice = asyncHandler(async (req, res) => {
    try {
        const vendor = req.user;
        const { subTotal, to, type, productWithPrice } = req.body
        const invoice = await generateInvoiceCode({ type: "4", fromVendorId: vendor.id, toId: to, toModel: "TempVendor" })

        if (!invoice) {
            return res.status(400).json({
                message: 'Failed to generate invoice',
                type: 'error',
            });
        }
        let newPurchaseInvoice = new PurchaseInvoice({
            ...req.body,
            toModel: "TempVendor",
            from: vendor.id,
            invoice: invoice._id,
            remainingAmount: subTotal
        });
        const { remainingAmount, walletDebit, isTottalyPaid, walletBalance } = await processWalletAndTransactionForVendor({ to, vendor, subTotal })
        await addRemoveAmountFromWallet({ customer: to, owner: vendor.id, amount: subTotal, ownerModel: "Vendor", customerModel: "TempVendor", amountType: "1" })
        await SaleAndPurchaseTransaction({ customer: to, owner: vendor.id, invoiceId: invoice._id, transactionType: "1", subType: "1", billingType: isTottalyPaid ? "1" : "0", amountType: "1", amount: walletDebit, totalAmount: subTotal, remainingAmount: remainingAmount, ownerModel: "Vendor", customerModel: "TempVendor", invoice: productWithPrice })
        if (isTottalyPaid) {
            newPurchaseInvoice.isPaid = true
            newPurchaseInvoice.remainingAmount = 0
        }
        else {
            newPurchaseInvoice.remainingAmount = remainingAmount
        }
        await newPurchaseInvoice.save();
        await updateProductStock({ vendorId: vendor.id, productWithPrice, type: '1', invoiceId: newPurchaseInvoice?.invoice })
        return res.status(201).json({
            message: 'Puchase invoice added successfully',
            type: 'success',
            purchaseInvoice: newPurchaseInvoice,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to add purchase invoice',
            error: error.message,
            type: 'error',
        });
    }
});

// return PurchaseInvoice
const returnPurchaseInvoice = asyncHandler(async (req, res) => {
    try {
        const vendor = req.user;
        const { subTotal, to, type, productWithPrice } = req.body
        const invoice = await generateInvoiceCode({ type: "5", fromVendorId: vendor.id, toId: to, toModel: "TempVendor" })

        if (!invoice) {
            return res.status(400).json({
                message: 'Failed to generate invoice',
                type: 'error',
            });
        }
        const newPurchaseInvoice = new PurchaseInvoice({
            ...req.body,
            toModel: "TempVendor",
            from: vendor.id,
            invoice: invoice._id,
            type: "1"
        });
        await newPurchaseInvoice.save();
        await addRemoveAmountFromWallet({ customer: to, owner: vendor.id, amount: subTotal, ownerModel: "Vendor", customerModel: "TempVendor", amountType: "0" })
        await SaleAndPurchaseTransaction({ customer: to, owner: vendor.id, invoiceId: invoice._id, transactionType: "1", subType: "2", amountType: "2", totalAmount: subTotal, ownerModel: "Vendor", customerModel: "TempVendor", invoice: productWithPrice })
        await updateProductStock({ vendorId: vendor.id, productWithPrice, type: '0', invoiceId: newPurchaseInvoice?.invoice })
        return res.status(201).json({
            message: 'Retrun Purchase invoice added successfully',
            type: 'success',
            purchaseInvoice: newPurchaseInvoice,
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: 'Failed to add return Purchase invoice',
            error: error.message,
            type: 'error',
        });
    }
});

// Get PurchaseInvoice by ID or all PurchaseInvoices
const getPurchaseInvoice = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const vendorId = req.user.id
        let purchaseInvoice;

        if (id) {
            // Get a specific purchase invoice by ID
            purchaseInvoice = await PurchaseInvoice.findById(id).populate('to from productWithPrice.productId invoice');

            if (!purchaseInvoice) {
                return res.status(404).json({
                    message: 'Purchase invoice not found',
                    type: 'error',
                });
            }
        } else {
            // Get all purchase invoices for the logged-in vendor
            purchaseInvoice = await PurchaseInvoice.find({ from: vendorId }).populate('to from productWithPrice.productId invoice').sort({ createdAt: -1 })
        }

        return res.status(200).json({
            purchaseInvoice,
            type: 'success',
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to retrieve purchase invoices',
            error: error.message,
            type: 'error',
        });
    }
});

const getPurchaseInvoicePartyWise = asyncHandler(async (req, res) => {
    try {
        const { userId } = req.params;
        const vendorId = req.user.id
        let purchaseInvoice;

        if (userId) {
            // Get all sale invoices for the logged-in vendor
            purchaseInvoice = await PurchaseInvoice.find({ from: vendorId, to: userId, type: "0" }).populate('to from productWithPrice.productId invoice').sort({ createdAt: -1 })

            if (!purchaseInvoice) {
                return res.status(404).json({
                    message: 'Purchase invoice not found',
                    type: 'error',
                });
            }
        }

        return res.status(200).json({
            purchaseInvoice,
            type: 'success',
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to retrieve purchase invoices',
            error: error.message,
            type: 'error',
        });
    }
});

module.exports = {
    addPurchaseInvoice,
    returnPurchaseInvoice,
    getPurchaseInvoice,
    getPurchaseInvoicePartyWise
}