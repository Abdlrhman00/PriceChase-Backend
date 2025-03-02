const Product = require("../models/product");
const { updatePopularProducts } = require("../utils/productService");

// Get Popular Products
exports.getPopularProducts = async (req, res) => {
    try {
        const products = await Product.find({ isPopular: true });
        res.status(200).json({message: 'Popular Products fetched succefully', products});
    } catch (err) {
        res.status(500).json({ message: "Error fetching popular products" });
    }
};

// Increment view count for a specific product
exports.incrementViewCount = async (req, res) => {
    const { productId } = req.params;
    try {
        await Product.findByIdAndUpdate(productId, { $inc: { Views: 1 } });
        res.json({ message: "View count updated" });
    } catch (err) {
        res.status(500).json({ message: "Error updating view count" });
    }
};


// Get Discounted Products (Price Dropped)
exports.getDiscountedProducts = async (req, res) => {
    try {
        const products = await Product.find({ hasDiscount: true });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: "Error fetching discounted products" });
    }
};