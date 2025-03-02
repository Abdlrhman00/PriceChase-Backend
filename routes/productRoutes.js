const express = require('express');
const router = express.Router();
//const { authorizeRoles } = require('../middleware/authorizeRoles');

const {
    incrementViewCount,
    getPopularProducts, getDiscountedProducts
} = require('../controllers/productController');

router.put("/:productId/view", incrementViewCount);
router.get("/popular", getPopularProducts);
router.get("/discounts", getDiscountedProducts);

module.exports = router;