const express = require("express");
const productController = require("../controllers/productController");
const router = express.Router();
const asyncHandler = require("express-async-handler");

const {
    incrementViewCount,
    getPopularProducts, getDiscountedProducts,searchFilters
} = require('../controllers/productController');

router.get("/", asyncHandler(productController.getAllProducts));
router.get("/popular", getPopularProducts);
router.get("/discounts", getDiscountedProducts);
router.get("/:id", asyncHandler(productController.getProductById));
router.put("/:productId/view", incrementViewCount);
router.get("/searchFilters", searchFilters)
router.post("/creatProduct");
module.exports = router;
