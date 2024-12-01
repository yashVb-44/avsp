const asyncHandler = require('express-async-handler');
const Product = require('../models/product');
const ProductLog = require('../models/productLog');

// Add Product
const addProduct = asyncHandler(async (req, res) => {
    try {
        const user = req.user;
        const { openStock, purchasePrice, date, unitType } = req.body
        const productData = { ...req.body, vendor: user.id, stock: openStock };

        const existingProduct = await Product.findOne({
            name: req.body.name,
            vendor: user.id
        });

        if (existingProduct) {
            return res.status(400).json({
                message: 'Product already exists',
                type: 'error'
            });
        }

        const newProduct = new Product(productData);
        await newProduct.save();

        const newProductLog = new ProductLog({
            "product": newProduct._id,
            "type": "0", // 0=in, 1=out
            "purchasePrice": purchasePrice,
            "stock": openStock,
            "unitType": unitType,
            "unit": openStock,
            "date": date,
            // "notes": "Stock added for seasonal demand"
        });
        await newProductLog.save();

        return res.status(201).json({
            message: 'Product added successfully',
            type: 'success',
            product: newProduct,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to add product',
            error: error.message,
            type: 'error',
        });
    }
});

// Get Product by ID or all products
// const getProduct = asyncHandler(async (req, res) => {
//     try {
//         const vendor = req.user;
//         const { id } = req.params;
//         let product;

//         if (id) {
//             // Get a specific product by ID
//             product = await Product.findById(id);

//             if (!product) {
//                 return res.status(404).json({
//                     message: 'Product not found',
//                     type: 'error',
//                 });
//             }
//         } else {
//             // Get all products
//             product = await Product.find({ vendor: vendor.id }).populate("category").sort({ createdAt: -1 })
//         }

//         return res.status(200).json({
//             product,
//             type: 'success',
//         });
//     } catch (error) {
//         return res.status(500).json({
//             message: 'Failed to retrieve products',
//             error: error.message,
//             type: 'error',
//         });
//     }
// });

const getProduct = asyncHandler(async (req, res) => {
    try {
        const vendor = req.user;
        const { id } = req.params;
        const { search, lowStock, outOfStock, sort } = req.body;
        const { categories } = req.body;

        let filter = { vendor: vendor.id };
        let sortOption = { createdAt: -1 }; // Default sorting: newest first

        // Filtering
        if (search) {
            filter.name = { $regex: search, $options: "i" }; // Case-insensitive search by name
        }

        if (outOfStock === true) {
            filter.stock = 0; // Out of stock
        }

        if (categories && categories.length > 0) {
            filter.category = { $in: categories }; // Filter by multiple categories
        }

        // Sorting
        switch (sort) {
            case "highToLow":
                sortOption.stock = -1; // Stock: high to low
                break;
            case "lowToHigh":
                sortOption.stock = 1; // Stock: low to high
                break;
            case "nameAsc":
                sortOption.name = 1; // Name: A-Z
                break;
            case "category":
                sortOption.category = 1; // Category-wise sorting
                break;
            default:
                break; // Default sorting by createdAt (newest first)
        }

        let product;

        if (id) {
            // Get a specific product by ID
            product = await Product.findById(id).populate("category");

            if (!product) {
                return res.status(404).json({
                    message: "Product not found",
                    type: "error",
                });
            }
        } else {
            // Get all products with filtering and sorting
            product = await Product.find(filter).populate("category").sort(sortOption);

            // Check low stock dynamically
            if (lowStock === true) {
                product = product.filter(p => p.stock <= p.lowStock);
            }
        }

        return res.status(200).json({
            product,
            type: "success",
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to retrieve products",
            error: error.message,
            type: "error",
        });
    }
});


// Update Product
const updateProduct = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                message: 'Product not found',
                type: 'error',
            });
        }

        // Update only the provided fields
        Object.assign(product, req.body);
        await product.save();

        return res.status(200).json({
            message: 'Product updated successfully',
            type: 'success',
            product,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to update product',
            error: error.message,
            type: 'error',
        });
    }
});

// Delete Product (by ID or all)
const deleteProduct = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        if (id) {
            // Delete a specific product by ID
            const product = await Product.findById(id);

            if (!product) {
                return res.status(404).json({
                    message: 'Product not found',
                    type: 'error',
                });
            }

            await Product.deleteOne({ _id: id });

            return res.status(200).json({
                message: 'Product deleted successfully',
                type: 'success',
            });
        } else {
            // Delete all products
            await Product.deleteMany();

            return res.status(200).json({
                message: 'All products deleted successfully',
                type: 'success',
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to delete products',
            error: error.message,
            type: 'error',
        });
    }
});

module.exports = {
    addProduct,
    getProduct,
    updateProduct,
    deleteProduct
};
