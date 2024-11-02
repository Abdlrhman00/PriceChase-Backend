const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    ReviewText: { type: String, required: true },
    Rating: { type: Number, required: true, min: 0, max: 5 }
});

const productSchema = new mongoose.Schema({
    Title: { type: String, required: true },
    Image: { type: String, required: true },
    ProductPage: { type: String, required: true },
    AverageRating: { type: Number, min: 0, max: 5 },
    Price: { type: Number, required: true },
    Currency: { type: String, required: true },
    Description: { type: String, required: true },
    Availability: { type: String, enum: ['IN_STOCK', 'OUT_OF_STOCK', 'PRE_ORDER'], required: true },
    SubCategoryID: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory', required: true },
    CategoryID: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    StoreID: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
    TopReviews: [reviewSchema]
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema, 'Product');
module.exports = Product;
