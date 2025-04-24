const express = require("express");
const productController = require("../controllers/productController");
const router = express.Router();
const asyncHandler = require("express-async-handler");

const {
    incrementViewCount,
    getPopularProducts, getDiscountedProducts
} = require('../controllers/productController');

router.get("/", asyncHandler(productController.getAllProducts));
router.get("/search", asyncHandler(productController.searchProducts));
router.get("/popular", getPopularProducts);
router.get("/discounts", getDiscountedProducts);
router.get("/:id", asyncHandler(productController.getProductById));
router.put("/:productId/view", incrementViewCount);
router.post("/creatProduct");
module.exports = router;
