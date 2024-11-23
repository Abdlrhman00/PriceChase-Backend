const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
    productID: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    addedDate: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    profilePhoto: { type: String },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }, 
    wishlist: [wishlistSchema]
});
 
const User = mongoose.model('User', userSchema, 'User');
module.exports = User;