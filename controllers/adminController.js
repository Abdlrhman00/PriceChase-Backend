const Product = require('../models/product');
// const Category = require('../models/category');
// const Subcategory = require('../models/subCategory');
const User = require('../models/user');

// Create a new product
// exports.createProduct = async (req, res) => {
//     try {
//         const newProduct = await Product.create(req.body);
//         res.status(201).json(newProduct);
//     } catch (error) {
//         res.status(400).json({ message: 'Error creating product', error });
//     }
// };

exports.getAllProducts = async (req, res) => {
    try {
        const Products = await Product.find();
        if(!Products){
            return res.status(404).json({ message: 'No Products available' });
        }
        res.status(200).json({message:"Products fetched succesfully" ,Products});
    } catch (error) {
        res.status(400).json({ message: 'Error getting products', error });
    }
};

// Update a product
exports.updateProduct = async (req, res) => {
    console.log('Updating product with ID:', req.params.id);

    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({message:"Product updated succesfully" , updatedProduct});
    } catch (error) {
        res.status(400).json({ message: 'Error updating product', error });
    }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if(!deletedProduct){
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ message: 'Product deleted succesfully' , deletedProduct});
    } catch (error) {
        res.status(400).json({ message: 'Error deleting product', error });
    }
};

// Get all usres
exports.getAllUsers = async (req, res) => {
    try {
        const getAllUsers = await User.find();
        res.status(200).json(getAllUsers);
    } catch (error) {
        res.status(400).json({ message: 'Error getting users', error });
    }
};

// Delete a user
exports.deleteUser = async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if(!deletedUser){
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted succesfully' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting user', error });
    }
};

// // Similarly, implement create, update, and delete for Categories and Subcategories
// exports.createCategory = async (req, res) => { /*...*/ };
// exports.updateCategory = async (req, res) => { /*...*/ };
// exports.deleteCategory = async (req, res) => { /*...*/ };

// exports.createSubcategory = async (req, res) => { /*...*/ };
// exports.updateSubcategory = async (req, res) => { /*...*/ };
// exports.deleteSubcategory = async (req, res) => { /*...*/ };