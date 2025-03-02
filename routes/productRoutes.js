const express = require("express");
const productController = require("../controllers/productController");
const router = express.Router();
const asyncHandler = require("express-async-handler");

router.get("/", asyncHandler(productController.getAllProducts));

router.get("/:id", asyncHandler(productController.getProductById));

module.exports = router;
 