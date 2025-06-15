const express = require("express");
const productController = require("../controllers/productController");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() }); // keep file in memory

const {
    incrementViewCount,
    getPopularProducts, getDiscountedProducts,searchFilters
} = require('../controllers/productController');

router.get("/", asyncHandler(productController.getAllProducts));
router.get("/search", asyncHandler(productController.searchProducts));
router.post("/search-by-image", upload.single("image"), asyncHandler(productController.searchByImage));
router.get("/popular", getPopularProducts);
router.get("/discounts", getDiscountedProducts);
router.get("/:id", asyncHandler(productController.getProductById));
router.put("/:productId/view", incrementViewCount);
router.get("/searchFilters", searchFilters)
router.post("/creatProduct");

module.exports = router;
