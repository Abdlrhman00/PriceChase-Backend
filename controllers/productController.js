const Product = require("../models/product");
const mongoose = require("mongoose");
const sendError = require("../utils/sendError");
const {
  updatePopularProducts,
  getProductFilters,
} = require("../utils/productService");
const { searchProduct } = require("../utils/searchProduct");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

// Get Popular Products
exports.getPopularProducts = async (req, res) => {
  try {
    const products = await Product.find({ isPopular: true });
    if (products.length > 0) {
      res
        .status(200)
        .json({ message: "Popular products fetched succefully", products });
    } else {
      res.status(200).json({ message: "No Popular products found", products });
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
    if (products.length > 0) {
      res
        .status(200)
        .json({ message: "Discounted products fetched succefully", products });
    } else {
      res
        .status(200)
        .json({ message: "No discounted products found", products });
    }
  } catch (err) {
    res.status(500).json({ message: "Error fetching discounted products" });
  }
};

exports.getAllProducts = async (req, res, next) => {
  // const products = await Product.find();

  // if (!products || products.length === 0) {
  //   return res.status(200).json({
  //     message: "No products found.",
  //     products: [],
  //   });
  // }

  // return res.status(200).json({
  //   message: "Products fetched successfully",
  //   count: products.length,
  //   data: products,
  // });
  try {
    let { limit = 10, cursor = null } = req.query;
    let filter = {};

    // 📌 Convert pagination values
    const limitNum = parseInt(limit);

    // 📌 Cursor-based Pagination
    if (cursor) {
      filter._id = { $gt: cursor };
    }

    //console.log(limitNum, cursor)

    const products = await Product.find(filter).limit(limitNum + 1);

    let nextCursor = null;
    if (products.length > limitNum) {
      nextCursor = products[limitNum]._id; // Set the next cursor to the last item of the current page
      products.pop(); // Remove the extra item to match the limit
    }

    if (!products.length) {
      return res.status(404).json({ message: "No products found" });
    }

    res.status(200).json({
      message: "Users fetched successfully",
      nextCursor,
      totalProducts: products.length,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Error getting products", error });
  }
};

exports.searchProducts = async (req, res, next) => {
    const { query, categoryName, subCategoryName, minPrice, maxPrice, minRating } = req.query;

  if (!query) {
    return next(sendError(400, "searchQuery"));
  }


  const products = await searchProduct(
    query,
    categoryName || null,
    subCategoryName || null,
    minPrice ? Number(minPrice) : null,
    maxPrice ? Number(maxPrice) : null,
    minRating ? Number(minRating) : null
  );

  if (!products || products.length === 0) {
    return next(sendError(404, "matchingProducts"));
  }



 // const products = await Product.find({Title:{ $regex: query,$options:"i"}})

  
  return res.status(200).json({
    message: "Products retrieved successfully",
    results: products.length,
    products,
  });
};


exports.searchByImage = async (req, res, next) => {

  const imageFile = req.file;

    if (!imageFile) {
      return next(sendError(400, "No image file provided"));
    }

        const formData = new FormData();
    formData.append('image', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

 
    // Call Flask ML server
    const flaskResponse = await axios.post("http://127.0.0.1:5050/predict", formData, {
      headers: formData.getHeaders(),
    });


    const label = flaskResponse.data.label;

    if (!label) {
      return next(sendError(400, "Could not get prediction from image"));
    }


  const products = await searchProduct(
    label
  );

  if (!products || products.length === 0) {
    return next(sendError(404, "matchingProducts"));
  }

  return res.status(200).json({
    message: "Products retrieved successfully",
    results: products.length,
    products,
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

// exports.createProduct = async (req, res) => {
//     try {
//       const {
//           Title, Image, ProductPage, AverageRating, Price, Currency,
//           Description, Availability, SubCategoryID, CategoryID, StoreID, TopReviews
//           , isPopular , priceDrop
//       } = req.body;

//       // Validate required fields
//       if (!Title || !Image || !ProductPage || !Price || !Currency || !Description || !Availability || !SubCategoryID || !CategoryID || !StoreID) {
//           return res.status(400).json({ message: "All required fields must be provided." });
//       }

//       // Create product instance
//       const newProduct = new Product({
//           Title, Image, ProductPage, AverageRating, Price, Currency,
//           Description, Availability, SubCategoryID, CategoryID, StoreID,
//           TopReviews,
//           Views: 0,
//           isPopular: false,
//           priceDrop: false
//       });

//       // Save product to database
//       await newProduct.save();

//       res.status(201).json({ message: "Product created successfully!", product: newProduct });
//   } catch (err) {
//       console.error(err);
//       res.status(500).json({ message: "Error creating product", error: err.message });
//   }
// }
