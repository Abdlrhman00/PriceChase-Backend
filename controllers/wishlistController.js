const User = require('../models/user');
const mongoose = require('mongoose');

// GET /wishlist
exports.getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('Wishlist.ProductID', 'Title Image Price');
        //const user = await User.findById(req.user.id).populate('Wishlist.ProductID', 'Title Image Price');
        res.json(user.Wishlist);
    } catch (err) {
        res.status(500).json({ message: "Error retrieving wishlist" });
    }
};

// POST /wishlist/:productId
exports.addProductToWishlist = async (req, res) => {
    const productId = req.params.productId;
    try {
        const user = await User.findById(req.params.id);
        //const user = await User.findById(req.user.id);
        if (user.Wishlist.some(item => item.ProductID.toString() === productId)) {
            return res.status(400).json({ message: "Product already in wishlist" });
        }
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            console.error('Invalid productId:', productId);
            
        }
        //user.Wishlist.push({ ProductID: mongoose.Types.ObjectId(productId), AddedDate: new Date()});
        user.Wishlist.push({ ProductID: productId, AddedDate: new Date()});
        await user.save();
        res.status(201).json({ message: "Product added to wishlist" , Wishlist: user.Wishlist});
    } catch (err) {
        res.status(500).json({ message: "Error adding product to wishlist" });
    }
};

// DELETE /wishlist/:productId
exports.removeProductFromWishlist = async (req, res) => {
    const { productId } = req.params;
    try {
        // const user = await User.findByIdAndUpdate(
        //     req.user.id,
        //     { $pull: { Wishlist: { ProductID: productId } } },
        //     { new: true }
        // );
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { $pull: { Wishlist: { ProductID: productId } } },
            { new: true }
        );
        res.json({ message: "Product removed from wishlist", Wishlist: user.Wishlist });
    } catch (err) {
        res.status(500).json({ message: "Error removing product from wishlist" });
    }
};
