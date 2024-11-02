const express = require('express');
const router = express.Router();

const { 
    getAllCategories, getCategoryById,
    getCategoryWithSubCategories, getCategoryProducts
} = require('../controllers/categoryController');

router.get('/',getAllCategories)
router.get('/:id/products',getCategoryProducts)
router.get('/:id/subcategories',getCategoryWithSubCategories)

module.exports = router;