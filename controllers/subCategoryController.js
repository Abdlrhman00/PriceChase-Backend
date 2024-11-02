const Product = require('../models/Product');

exports.getSubCategoryProducts = async (req, res) => {
    console.log(req.params.id);
    try {
        const products = await Product.find({ SubCategoryID: req.params.id });
        if (!products || products.length === 0) {
            return res.status(404).json({ message: 'No products found with this subcategory' });
        }
        res.status(200).json({message: 'Products fetched succefully', products});
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: 'Error getting products', error });
    }
};
