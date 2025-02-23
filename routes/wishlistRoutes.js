const express = require('express');
const router = express.Router();

const {
    getWishlist, addProductToWishlist,
    removeProductFromWishlist
} = require('../controllers/wishlistController');

router.get('/:id',getWishlist)
router.post('/:id/:productId', addProductToWishlist)
router.delete('/:id/:productId', removeProductFromWishlist)

module.exports = router;