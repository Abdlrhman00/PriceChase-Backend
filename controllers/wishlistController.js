const User = require('../models/user');
const mongoose = require('mongoose');

// GET /wishlist
exports.getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('wishlist.productID', 'Title Image Price');
        //const user = await User.findById(req.user.id).populate('Wishlist.ProductID', 'Title Image Price');

        if (!user.wishlist || user.wishlist.length === 0) {
            return res.status(200).json({ message: "Your wishlist is empty" , Wishlist: []});
        }

        res.json(user.wishlist);
    } catch (err) {
        res.status(500).json({ message: "Error retrieving wishlist"});
    }
};

// POST /wishlist/:productId
exports.addProductToWishlist = async (req, res) => {
    const productId = req.params.productId;
    try {
        const user = await User.findById(req.user.id);
        //const user = await User.findById(req.user.id);
        if (user.wishlist.some(item => item.productID.toString() === productId)) {
            return res.status(400).json({ message: "Product already in wishlist" });
        }
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            console.error('Invalid productId:', productId);
            
        }
        //user.Wishlist.push({ ProductID: mongoose.Types.ObjectId(productId), AddedDate: new Date()});
        user.wishlist.push({ productID: productId, addedDate: new Date()});
        await user.save();
        res.status(201).json({ message: "Product added to wishlist" , Wishlist: user.wishlist});
    } catch (err) {
        res.status(500).json({ message: "Error adding product to wishlist" , type: err});
    }
};

// DELETE /wishlist/:productId
exports.removeProductFromWishlist = async (req, res) => {
    const { productId } = req.params;
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the product exists in the wishlist before attempting removal
        const productExists = user.wishlist.some(item => item.productID.toString() === productId);

        if (!productExists) {
            return res.status(400).json({ message: "Product not found in wishlist" });
        }

        // Now perform the removal
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { $pull: { wishlist: { productID: productId } } },
            { new: true }
        );

        res.json({ message: "Product removed from wishlist", wishlist: updatedUser.wishlist });
    } catch (err) {
        res.status(500).json({ message: "Error removing product from wishlist" });
    }
};

