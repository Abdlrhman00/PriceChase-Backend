const Product = require("../models/product");
const mongoose = require("mongoose");
const sendError = require("../utils/sendError");
const { updatePopularProducts } = require("../utils/productService");

// Get Popular Products
exports.getPopularProducts = async (req, res) => {
    try {
        const products = await Product.find({ isPopular: true });
        if(products.length > 0){
            res.status(200).json({message: 'Popular products fetched succefully', products});
        }
        else{
            res.status(404).json({message: 'No Popular products found', products});
        }
    } catch (err) {
        res.status(500).json({ message: "Error fetching popular products" });
    }
};

// Increment view count for a specific product
exports.incrementViewCount = async (req, res) => {
    const { productId } = req.params;
    try {
        await Product.findByIdAndUpdate(productId, { $inc: { Views: 1 } });
        res.status(200).json({ message: "View count updated" });
    } catch (err) {
        res.status(500).json({ message: "Error updating view count" });
    }
};

// Get Discounted Products (Price Dropped)
exports.getDiscountedProducts = async (req, res) => {
    try {
        const products = await Product.find({ priceDrop: true });
        if(products.length > 0){
            res.status(200).json({message: 'Discounted products fetched succefully', products});
        }
        else{
            res.status(404).json({message: 'No discounted products found', products});
        }
    } catch (err) {
        res.status(500).json({ message: "Error fetching discounted products" });
    }
};

exports.getAllProducts = async (req, res, next) => {
  const products = await Product.find();

  if (!products || products.length === 0) {
    return res.status(200).json({
      message: "No products found.",
      products: [],
    });
  }

  return res.status(200).json({
    message: "Products fetched successfully",
    count: products.length,
    data: products,
  });
}; 

exports.getProductById = async (req, res, next) => {
  const { id } = req.params;

  // Validate ID
  if (!mongoose.isValidObjectId(id)) {
    return next(sendError(400, "invalidProductId"));
  }
  const product = await Product.findById(id);

  if (!product) {
    return next(sendError(404, "product"));
  }

  res.status(200).json({
    message: "Product fetched successfully",
    data: product,
  });
};
