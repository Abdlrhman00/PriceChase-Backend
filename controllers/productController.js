const Product = require("../models/product");
const mongoose = require("mongoose");
const sendError = require("../utils/sendError");
const { updatePopularProducts,  getProductFilters} = require("../utils/productService");

// Get Popular Products
exports.getPopularProducts = async (req, res) => {
    try {
        const products = await Product.find({ isPopular: true });
        if(products.length > 0){
            res.status(200).json({message: 'Popular products fetched succefully', products});
        }
        else{
            res.status(200).json({message: 'No Popular products found', products});
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
            res.status(200).json({message: 'No discounted products found', products});
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
    let {limit = 10, cursor=null} = req.query
    let filter = {}

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
        nextCursor = products[limitNum]._id;  // Set the next cursor to the last item of the current page
        products.pop();  // Remove the extra item to match the limit
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

exports.searchFilters = async (req, res) => {
    try {
        let { product_ids } = req.query;

        // Convert single or multiple query values to an array
        if (!product_ids) {
            return res.status(400).json({ message: "No product IDs provided" });
        }

        if (typeof product_ids === 'string') {
            product_ids = product_ids.split(','); // Handle comma-separated string
        }

        if (!Array.isArray(product_ids) || product_ids.length === 0) {
            return res.status(400).json({ message: "Invalid product_ids format" });
        }

        // Convert to ObjectId if needed
        const mongoose = require('mongoose');
        const productObjectIds = product_ids.map(id => mongoose.Types.ObjectId(id));

        // Apply filters, sort, pagination
        const { filter, sortCriteria, limitNum } = getProductFilters(req.query);

        // Filter only the specified products
        filter._id = { $in: productObjectIds };

        // Fetch filtered, sorted products
        const products = await Product.find(filter)
            .sort(sortCriteria)
            .limit(limitNum + 1); // Fetch one extra item to determine if next page exists

        let nextCursor = null;
        if (products.length > limitNum) {
            nextCursor = products[limitNum]._id;
            products.pop();
        }

        if (!products.length) {
            return res.status(404).json({ message: "No products found with these filters" });
        }

        res.status(200).json({
            message: "Filtered products fetched successfully",
            nextCursor,
            totalProducts: products.length,
            products,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error filtering products", error });
    }
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