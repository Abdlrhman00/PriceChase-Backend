const express = require('express');
const router = express.Router();
const { authorizeRoles } = require('../middleware/authorizeRoles');

const {
    getPopularProducts, getDiscountedProducts
} = require('../controllers/productController');

router.get("/popular", getPopularProducts);
router.get("/discounts", getDiscountedProducts);