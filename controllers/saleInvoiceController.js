const asyncHandler = require('express-async-handler');
const SaleInvoice = require('../models/saleInvoice');
const { SaleTransaction } = require('../utils/transaction');
const { generateInvoiceCode } = require('../utils/invoice');
const { addRemoveAmountFromWallet, getCustmoreWalletBalance, processWalletAndTransaction } = require('../utils/wallet');

// Add SaleInvoice
const addSaleInvoice = asyncHandler(async (req, res) => {
    try {
        const vendor = req.user;
        const { subTotal, to, type } = req.body
        const invoice = await generateInvoiceCode({ type: "1", fromVendorId: vendor.id, toId: to, toModel: "User" })

        if (!invoice) {
            return res.status(400).json({
                message: 'Failed to generate invoice',
                type: 'error',
            });
        }
        const newSaleInvoice = new SaleInvoice({
            ...req.body,
            toModel: "User",
            from: vendor.id,
            invoice: invoice._id
        });
        await newSaleInvoice.save();
        const { remainingAmount, walletDebit, isWalletDebit, isTottalyPaid } = processWalletAndTransaction({ to, vendor, subTotal })
        await addRemoveAmountFromWallet({ customer: to, owner: vendor.id, amount: subTotal, ownerModel: "Vendor", customerModel: "User", amountType: "0" })
        await SaleTransaction({ customer: to, owner: vendor.id, invoiceId: invoice._id, transactionType: "0", subType: "1", billingType: isTottalyPaid ? "1" : "0", amountType: "0", paymentType: "2", amount: walletDebit, totalAmount: subTotal, remainingAmount: remainingAmount, ownerModel: "Vendor", customerModel: "User", isDebitFromWallet: isWalletDebit ? "1" : "0", isWithAddOnAmount: "0" })
        return res.status(201).json({
            message: 'Sale invoice added successfully',
            type: 'success',
            saleInvoice: newSaleInvoice,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to add sale invoice',
            error: error.message,
            type: 'error',
        });
    }
});

// return SaleInvoice
const returnSaleInvoice = asyncHandler(async (req, res) => {
    try {
        const user = req.user;
        const { subTotal, to, type } = req.body
        const invoice = await generateInvoiceCode({ type: "3", fromVendorId: user.id, toId: to, toModel: "User" })

        if (!invoice) {
            return res.status(400).json({
                message: 'Failed to generate invoice',
                type: 'error',
            });
        }
        const newSaleInvoice = new SaleInvoice({
            ...req.body,
            toModel: "User",
            from: user.id,
            invoice: invoice._id
        });
        await newSaleInvoice.save();
        // const { remainingAmount, walletDebit, isWalletDebit, isTottalyPaid } = processWalletAndTransaction({ to, vendor, subTotal })
        await SaleTransaction({ customer: to, owner: user.id, invoiceId: invoice._id, transactionType: "0", subType: "2", billingType: "0", amountType: "0", amount: subTotal, ownerModel: "Vendor", customerModel: "User" })
        return res.status(201).json({
            message: 'Retrun Sale invoice added successfully',
            type: 'success',
            saleInvoice: newSaleInvoice,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to add return sale invoice',
            error: error.message,
            type: 'error',
        });
    }
});

// Get SaleInvoice by ID or all SaleInvoices
const getSaleInvoice = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id
        let saleInvoice;

        if (id) {
            // Get a specific sale invoice by ID
            saleInvoice = await SaleInvoice.findById(id).populate('to from productWithPrice.productId');

            if (!saleInvoice) {
                return res.status(404).json({
                    message: 'Sale invoice not found',
                    type: 'error',
                });
            }
        } else {
            // Get all sale invoices for the logged-in vendor
            saleInvoice = await SaleInvoice.find({ from: userId }).populate('to from productWithPrice.productId').sort({ createdAt: -1 })
        }

        return res.status(200).json({
            saleInvoice,
            type: 'success',
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to retrieve sale invoices',
            error: error.message,
            type: 'error',
        });
    }
});

// Get SaleInvoice by ID or all SaleInvoices
const getSaleInvoicePartyWise = asyncHandler(async (req, res) => {
    try {
        const { userId } = req.params;
        const vendorId = req.user.id
        let saleInvoice;

        if (userId) {
            // Get all sale invoices for the logged-in vendor
            saleInvoice = await SaleInvoice.find({ from: vendorId, to: userId }).populate('to from productWithPrice.productId').sort({ createdAt: -1 })

            if (!saleInvoice) {
                return res.status(404).json({
                    message: 'Sale invoice not found',
                    type: 'error',
                });
            }
        }

        return res.status(200).json({
            saleInvoice,
            type: 'success',
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to retrieve sale invoices',
            error: error.message,
            type: 'error',
        });
    }
});

// Update SaleInvoice
const updateSaleInvoice = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const saleInvoice = await SaleInvoice.findById(id);

        if (!saleInvoice) {
            return res.status(404).json({
                message: 'Sale invoice not found',
                type: 'error',
            });
        }

        // Update only the provided fields
        Object.assign(saleInvoice, req.body);
        await saleInvoice.save();

        return res.status(200).json({
            message: 'Sale invoice updated successfully',
            type: 'success',
            saleInvoice,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to update sale invoice',
            error: error.message,
            type: 'error',
        });
    }
});

// Delete SaleInvoice (by ID or all)
const deleteSaleInvoice = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        if (id) {
            // Delete a specific sale invoice by ID
            const saleInvoice = await SaleInvoice.findById(id);

            if (!saleInvoice) {
                return res.status(404).json({
                    message: 'Sale invoice not found',
                    type: 'error',
                });
            }

            await SaleInvoice.deleteOne({ _id: id });

            return res.status(200).json({
                message: 'Sale invoice deleted successfully',
                type: 'success',
            });
        } else {
            // Delete all sale invoices for the logged-in vendor
            await SaleInvoice.deleteMany({ from: req.user._id });

            return res.status(200).json({
                message: 'All sale invoices deleted successfully',
                type: 'success',
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to delete sale invoices',
            error: error.message,
            type: 'error',
        });
    }
});

module.exports = {
    addSaleInvoice,
    returnSaleInvoice,
    getSaleInvoice,
    updateSaleInvoice,
    deleteSaleInvoice,
    getSaleInvoicePartyWise
};
