const asyncHandler = require('express-async-handler');
const ProductLog = require('../models/productLog');
const Product = require('../models/product');

// In & Out Product
const InOutProduct = asyncHandler(async (req, res) => {
    try {
        const user = req.user;
        const productData = { ...req.body, vendor: user.id };
        const { type, product, unit } = req.body
        const newProductLog = new ProductLog(productData);
        const spare = await Product.findById({ _id: product, vendor: user.id })
        if (!spare) {
            return res.status(404).json({
                message: 'Failed to add product history',
                type: 'error',
            });
        }
        if (type === "0") {
            spare.stock += unit
        } else {
            spare.stock -= unit
        }
        await spare.save()
        await newProductLog.save();

        return res.status(201).json({
            message: 'Product history added successfully',
            type: 'success',
            productLog: newProductLog,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to add product history',
            error: error.message,
            type: 'error',
        });
    }
});

// // Get Product history by ID or all product history
const getProductHistory = asyncHandler(async (req, res) => {
    try {
        const vendor = req.user;
        const { id } = req.params;
        let productHistory;

        if (id) {
            // Get a specific product by ID
            // productHistory = await ProductLog.find({ vendor: vendor.id, product: id }).sort({ createdAt: -1 })
            productHistory = await ProductLog.find({ product: id }).sort({ createdAt: -1 }).populate("invoiceId")
            if (!productHistory) {
                return res.status(404).json({
                    message: 'Product history not found',
                    type: 'error',
                });
            }
        }

        return res.status(200).json({
            productHistory,
            type: 'success',
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to retrieve product history',
            error: error.message,
            type: 'error',
        });
    }
});

// // Update Product
// const updateProduct = asyncHandler(async (req, res) => {
//     try {
//         const { id } = req.params;
//         const product = await Product.findById(id);

//         if (!product) {
//             return res.status(404).json({
//                 message: 'Product not found',
//                 type: 'error',
//             });
//         }

//         // Update only the provided fields
//         Object.assign(product, req.body);
//         await product.save();

//         return res.status(200).json({
//             message: 'Product updated successfully',
//             type: 'success',
//             product,
//         });
//     } catch (error) {
//         return res.status(500).json({
//             message: 'Failed to update product',
//             error: error.message,
//             type: 'error',
//         });
//     }
// });

// // Delete Product (by ID or all)
// const deleteProduct = asyncHandler(async (req, res) => {
//     try {
//         const { id } = req.params;

//         if (id) {
//             // Delete a specific product by ID
//             const product = await Product.findById(id);

//             if (!product) {
//                 return res.status(404).json({
//                     message: 'Product not found',
//                     type: 'error',
//                 });
//             }

//             await Product.deleteOne({ _id: id });

//             return res.status(200).json({
//                 message: 'Product deleted successfully',
//                 type: 'success',
//             });
//         } else {
//             // Delete all products
//             await Product.deleteMany();

//             return res.status(200).json({
//                 message: 'All products deleted successfully',
//                 type: 'success',
//             });
//         }
//     } catch (error) {
//         return res.status(500).json({
//             message: 'Failed to delete products',
//             error: error.message,
//             type: 'error',
//         });
//     }
// });

module.exports = {
    InOutProduct,
    getProductHistory
};
