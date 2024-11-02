const mongoose = require('mongoose');

const subCategorySchema = new mongoose.Schema({
    SubCategoryName: { type: String, required: true }
});

const SubCategory = mongoose.model('SubCategory', subCategorySchema , 'SubCategory');
module.exports = SubCategory;