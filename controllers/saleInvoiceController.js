const asyncHandler = require('express-async-handler');
const SaleInvoice = require('../models/saleInvoice');
const { SaleAndPurchaseTransaction } = require('../utils/transaction');
const { generateInvoiceCode } = require('../utils/invoice');
const { addRemoveAmountFromWallet, getCustmoreWalletBalance, processWalletAndTransaction } = require('../utils/wallet');
const { updateProductStock } = require('../utils/product');

// Add SaleInvoice
const addSaleInvoice = asyncHandler(async (req, res) => {
    try {
        const vendor = req.user;
        const { subTotal, to, type, productWithPrice } = req.body
        const invoice = await generateInvoiceCode({ type: "1", fromVendorId: vendor.id, toId: to, toModel: "User" })

        if (!invoice) {
            return res.status(400).json({
                message: 'Failed to generate invoice',
                type: 'error',
            });
        }
        let newSaleInvoice = new SaleInvoice({
            ...req.body,
            toModel: "User",
            from: vendor.id,
            invoice: invoice._id,
            remainingAmount: subTotal
        });
        const { remainingAmount, walletDebit, isWalletDebit, isTottalyPaid, walletBalance } = await processWalletAndTransaction({ to, vendor, subTotal })
        await addRemoveAmountFromWallet({ customer: to, owner: vendor.id, amount: subTotal, ownerModel: "Vendor", customerModel: "User", amountType: "0" })
        await SaleAndPurchaseTransaction({ customer: to, owner: vendor.id, invoiceId: invoice._id, transactionType: "0", subType: "1", billingType: isTottalyPaid ? "1" : "0", amountType: "0", paymentType: "2", amount: walletDebit, totalAmount: subTotal, remainingAmount: remainingAmount, ownerModel: "Vendor", customerModel: "User", isDebitFromWallet: isWalletDebit ? "1" : "0", isWithAddOnAmount: "0", invoice: productWithPrice })
        if (walletBalance >= subTotal) {
            newSaleInvoice.isPaid = true
            newSaleInvoice.remainingAmount = 0
        }
        else if (walletBalance <= subTotal) {
            newSaleInvoice.remainingAmount -= subTotal
        }
        await updateProductStock({ vendorId: vendor.id, productWithPrice, type: '0' })
        await newSaleInvoice.save();
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
        const vendor = req.user;
        const { subTotal, to, type, productWithPrice } = req.body
        const invoice = await generateInvoiceCode({ type: "3", fromVendorId: vendor.id, toId: to, toModel: "User" })

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
            invoice: invoice._id,
            type: "1"
        });
        await newSaleInvoice.save();
        // const { remainingAmount, walletDebit, isWalletDebit, isTottalyPaid } = processWalletAndTransaction({ to, vendor, subTotal })
        await addRemoveAmountFromWallet({ customer: to, owner: vendor.id, amount: subTotal, ownerModel: "Vendor", customerModel: "User", amountType: "1" })
        await SaleAndPurchaseTransaction({ customer: to, owner: vendor.id, invoiceId: invoice._id, transactionType: "0", subType: "2", amountType: "0", paymentType: "2", totalAmount: subTotal, ownerModel: "Vendor", customerModel: "User", invoice: productWithPrice })
        await updateProductStock({ vendorId: vendor.id, productWithPrice, type: '1' })
        return res.status(201).json({
            message: 'Retrun Sale invoice added successfully',
            type: 'success',
            saleInvoice: newSaleInvoice,
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: 'Failed to add return sale invoice',
            error: error.message,
            type: 'error',
        });
    }
});

// counter SaleInvoice
const counterSaleInvoice = asyncHandler(async (req, res) => {
    try {
        const user = req.user;
        const to = req.user.id
        const { subTotal, type, productWithPrice } = req.body
        const invoice = await generateInvoiceCode({ type: "2", fromVendorId: user.id, toId: to, toModel: "Vendor" })

        if (!invoice) {
            return res.status(400).json({
                message: 'Failed to generate invoice',
                type: 'error',
            });
        }
        const newSaleInvoice = new SaleInvoice({
            ...req.body,
            toModel: "Vendor",
            from: user.id,
            to,
            invoice: invoice._id
        });
        await newSaleInvoice.save();
        await SaleAndPurchaseTransaction({ customer: to, owner: user.id, invoiceId: invoice._id, transactionType: "0", subType: "5", billingType: "1", amountType: "0", amount: subTotal, ownerModel: "Vendor", customerModel: "Vendor", invoice: productWithPrice })
        return res.status(201).json({
            message: 'Counter Sale invoice added successfully',
            type: 'success',
            saleInvoice: newSaleInvoice,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to add counter sale invoice',
            error: error.message,
            type: 'error',
        });
    }
});

// Get SaleInvoice by ID or all SaleInvoices
const getSaleInvoice = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const vendorId = req.user.id
        let saleInvoice;

        if (id) {
            // Get a specific sale invoice by ID
            saleInvoice = await SaleInvoice.findById(id).populate('to from productWithPrice.productId invoice');

            if (!saleInvoice) {
                return res.status(404).json({
                    message: 'Sale invoice not found',
                    type: 'error',
                });
            }
        } else {
            // Get all sale invoices for the logged-in vendor
            saleInvoice = await SaleInvoice.find({ from: vendorId }).populate('to from productWithPrice.productId invoice').sort({ createdAt: -1 })
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
            saleInvoice = await SaleInvoice.find({ from: vendorId, to: userId, type: "0" }).populate('to from productWithPrice.productId invoice').sort({ createdAt: -1 })

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
            await SaleInvoice.deleteMany({ from: req.user.id });

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
    getSaleInvoicePartyWise,
    counterSaleInvoice
};
