const Category = require('../models/category');
const Product = require('../models/Product');
const mongoose = require('mongoose');

exports.getAllCategories = async (req, res) => {
    try {
        const Categories = await Category.find({}, '_id CategoryName');
        if(!Categories){
            return res.status(404).json({ message: 'No Categories available' });
        }
        res.status(200).json({messege: "Categories fetched succefully", Categories});
    } catch (error) {
        res.status(400).json({ message: 'Error getting Categories', error });
    }
};

exports.getCategoryById = async (req, res) => {
    console.log(req.params.id);
    try {
        const category = await Category.findById(req.params.id); // lowercase variable
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json(category);
    } catch (error) {
        res.status(400).json({ message: 'Error getting category', error });
    }
};

exports.getCategoryWithSubCategories = async (req, res) => {
    try {
        const categoryId = new mongoose.Types.ObjectId(req.params.id); // Corrected with 'new'

        const result = await Category.aggregate([
            { $match: { _id: categoryId } }, // Match the Men category
            {
                $lookup: {
                from: "SubCategory",          // The collection to join
                localField: "SubCategoryIDs",   // Field in categories
                foreignField: "_id",            // Field in subcategories
                as: "SubCategoriesDetails"       // Name of the output array
                }
            },
            { 
                $project: { SubCategoriesDetails: 1 , CategoryName: 1} // Only include SubCategoriesDetails in the output
            }
        ]);

        if (!result || result.length === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.status(200).json({message: "SubCategories info fetched succefully", result: result[0]}); // Return the first (and only) item in the result array
    } catch (error) {
        console.error("Error fetching category with subcategories:", error);
        res.status(400).json({ message: 'Error getting Category', error });
    }
};

exports.getCategoryProducts = async (req, res) => {
    console.log(req.params.id);
    try {
        const products = await Product.find({ CategoryID: req.params.id }); // lowercase variable
        if (!products) {
            return res.status(404).json({ message: 'No products found with this category' });
        }
        res.status(200).json({message: 'Products fetched succefully', products});
    } catch (error) {
        console.log(error)
        res.status(400).json({ message: 'Error getting category', error: error });
    }
};