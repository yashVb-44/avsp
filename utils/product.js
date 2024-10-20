const Product = require("../models/product");
const Booking = require("../models/booking");

const updateProductStock = async ({
    productWithPrice,
    vendorId,
    type, // Example: 'sale = 0' or 'restock = 1'
}) => {
    try {
        // Loop through each product in the productWithPrice array
        productWithPrice.length > 0 && await Promise.all(productWithPrice.map(async (product) => {
            const { productId, quantity } = product;

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
            } else if (type === '1') {
                // console.log("1", foundProduct.stock)
                // If it's a restock, increase the stock by the quantity
                foundProduct.stock += quantity;
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