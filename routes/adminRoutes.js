const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/authMiddleware');
// const { 
//     createProduct, updateProduct, deleteProduct,
//     createCategory, updateCategory, deleteCategory,
//     createSubcategory, updateSubcategory, deleteSubcategory,
//     getAllUsers, deleteUser
// } = require('../controllers/adminController');

const { 
    updateProduct, deleteProduct, getAllProducts,
    getAllUsers, deleteUser
} = require('../controllers/adminController');

router.get('/products', getAllProducts);  // Update a product
// Admin routes for Products
//router.post('/products', isAdmin, createProduct);     // Create a product
//router.put('/products/:id', isAdmin, updateProduct);  // Update a product
router.put('/products/:id', updateProduct);  // Update a product
//router.delete('/products/:id', isAdmin, deleteProduct); // Delete a product
router.delete('/products/:id', deleteProduct); // Delete a product

// // Admin routes for Categories
// router.post('/categories', isAdmin, createCategory);  // Create a category
// router.put('/categories/:id', isAdmin, updateCategory);  // Update a category
// router.delete('/categories/:id', isAdmin, deleteCategory);  // Delete a category

// // Admin routes for Subcategories
// router.post('/subcategories', isAdmin, createSubcategory);  // Create a subcategory
// router.put('/subcategories/:id', isAdmin, updateSubcategory);  // Update a subcategory
// router.delete('/subcategories/:id', isAdmin, deleteSubcategory);  // Delete a subcategory

// // Admin routes for Users
//router.get('/users', isAdmin, getAllUsers);  // get users
router.get('/users', getAllUsers);  // get users
// router.delete('/users/:id', isAdmin, deleteUser); // delete user
router.delete('/users/:id', deleteUser); // delete user

module.exports = router;
