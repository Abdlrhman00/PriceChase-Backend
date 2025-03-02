const Product = require("../models/product");
const mongoose = require("mongoose");
const sendError = require("../utils/sendError");

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
