const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    CategoryName: { type: String, required: true },
    SubCategoryIDs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory' }]
});

const Category = mongoose.model('Category', categorySchema , 'Category');
module.exports = Category;