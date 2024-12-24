const Product = require("../models/product");
const Booking = require("../models/booking");
const ProductLog = require("../models/productLog");

const updateProductStock = async ({
    productWithPrice,
    vendorId,
    invoiceId,
    type, // Example: 'sale = 0' or 'restock = 1'
}) => {
    try {
        // Loop through each product in the productWithPrice array
        productWithPrice.length > 0 && await Promise.all(productWithPrice.map(async (product) => {
            const { productId, quantity, price, productName } = product;

            // Find the product in the database by productId and vendorId
            const foundProduct = await Product.findOne({ _id: productId, vendor: vendorId });

            if (!foundProduct) {
                throw new Error(`Product with ID ${productId} not found`);
            }

            // Update stock based on the type
            if (type === '0' && foundProduct.stock >= quantity) {
                // console.log("0", foundProduct.stock)
                // If it's a sale, reduce the stock by the quantity sold

                foundProduct.stock -= quantity;
                const newProductLog = new ProductLog({
                    "product": productId,
                    "type": "1", // 0=in, 1=out
                    "salePrice": price,
                    "vendor": vendorId,
                    // "purchasePrice": price,
                    "stock": foundProduct.stock - quantity,
                    "unitType": foundProduct.unitType,
                    "unit": quantity,
                    "invoiceId": invoiceId
                    // "date": "2024-09-14",
                    // "notes": "Stock added for seasonal demand"
                });
                await newProductLog.save();
            } else if (type === '1') {
                // console.log("1", foundProduct.stock)
                // If it's a restock, increase the stock by the quantity
                foundProduct.stock += quantity;
                const newProductLog = new ProductLog({
                    "product": productId,
                    "type": "0", // 0=in, 1=out
                    // "salePrice": price,
                    "purchasePrice": price,
                    "vendor": vendorId,
                    "stock": foundProduct.stock + quantity,
                    "unitType": foundProduct.unitType,
                    "unit": quantity,
                    "invoiceId": invoiceId
                    // "date": "2024-09-14",
                    // "notes": "Stock added for seasonal demand"
                });
                await newProductLog.save();
            }

            // Save the updated product in the database
            await foundProduct.save();
        }));

        return {
            success: true,
            message: "Stock updated successfully",
        };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Error updating stock", error: error.message };
    }
};

module.exports = {
    updateProductStock
}