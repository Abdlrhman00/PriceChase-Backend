const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
    ProductID: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    AddedDate: { type: Date, required: true }
});

const userSchema = new mongoose.Schema({
    FirstName: { type: String, required: true },
    LastName: { type: String, required: true },
    Email: { type: String, required: true, unique: true },
    Password: { type: String, required: true },
    ProfilePhoto: { type: String, required: true },
    Wishlist: [wishlistSchema]
});

const User = mongoose.model('User', userSchema, 'User');
module.exports = User;