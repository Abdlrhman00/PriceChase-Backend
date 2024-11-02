const express = require('express');
const router = express.Router();

const {
    getSubCategoryProducts
} = require('../controllers/subCategoryController');

router.get('/:id/products',getSubCategoryProducts)

module.exports = router;