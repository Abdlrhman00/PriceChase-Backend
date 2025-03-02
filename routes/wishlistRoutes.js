const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');

const {
    getWishlist, addProductToWishlist,
    removeProductFromWishlist
} = require('../controllers/wishlistController');

router.get('/', verifyToken, getWishlist)
router.post('/:productId', verifyToken, addProductToWishlist)
router.delete('/:productId', verifyToken, removeProductFromWishlist)

module.exports = router;