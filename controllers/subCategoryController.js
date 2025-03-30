const Product = require('../models/product');
const { getProductFilters } = require("../utils/productService");

// exports.getSubCategoryProducts = async (req, res) => {
//     console.log(req.params.id);
//     try {
//         const products = await Product.find({ SubCategoryID: req.params.id });
//         if (!products || products.length === 0) {
//             return res.status(404).json({ message: 'No products found with this subcategory' });
//         }
//         res.status(200).json({message: 'Products fetched succefully', products});
//     } catch (error) {
//         console.log(error);
//         res.status(400).json({ message: 'Error getting products', error });
//     }
// };
exports.getSubCategoryProducts = async (req, res) => {
    try {
        const { filter, sortCriteria, limitNum } = getProductFilters(req.query);

        // 📌 Ensure filter includes SubCategoryID
        filter.SubCategoryID = req.params.id;

        // 📌 Fetch products with filters, sorting, and cursor-based pagination
        const products = await Product.find(filter)
            .sort(sortCriteria)  // Apply sorting first
            .limit(limitNum + 1); // Fetch one extra item to check if there's a next page

        let nextCursor = null;
        if (products.length > limitNum) {
            nextCursor = products[limitNum]._id;  // Set the next cursor to the last item of the current page
            products.pop();  // Remove the extra item to match the limit
        }

        if (!products.length) {
            return res.status(404).json({ message: "No products found with this subcategory" });
        }

        res.status(200).json({
            message: "Products fetched successfully",
            nextCursor,
            totalProducts: products.length,
            products,
        });
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: "Error getting products", error });
    }
};
