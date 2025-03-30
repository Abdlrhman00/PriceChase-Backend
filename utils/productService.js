const Product = require("../models/product");

const updatePopularProducts = async () => {
    try {
        // Get distinct subcategories
        const subcategories = await Product.distinct('subcategory');

        for (let subcategory of subcategories) {
            // Fetch top 10 products for this subcategory, sorted by views
            const topProducts = await Product.find({ subcategory })
                .sort({ Views: -1 })
                .limit(3);

            // Reset the 'isPopular' field for all products in this subcategory
            await Product.updateMany({ subcategory }, { isPopular: false });

            // Get the IDs of the top products
            const topProductIds = topProducts.map(p => p._id);

            // Mark the top 10 products in this subcategory as popular
            await Product.updateMany(
                { _id: { $in: topProductIds } },
                { isPopular: true }
            );

            console.log(`✅ Popular products updated for subcategory: ${subcategory}`);
        }
    } catch (error) {
        console.error("❌ Error updating popular products:", error);
    }
};

const getProductFilters = (query) => {
    let { popular, minPrice, maxPrice, rating, sortBy, order = "asc", limit = 10, cursor } = query;

    let filter = {};
    let sortCriteria = {};
    let defaultSort = "popular"; // Default sort order

    // 📌 Apply filters based on the request query
    if (popular === "true") {
        filter.Views = { $gt: 0 }; // Only products with views > 0
        defaultSort = "popular"; // Set default sort to "popular" if this filter is applied
    }
    else if (rating) {
        const ratingValue = parseFloat(rating);
        const nextRating = Number.isInteger(ratingValue) ? ratingValue + 1 : Math.ceil(ratingValue);

        console.log("ratingValue: ", ratingValue, "nextRating: ", nextRating);

        filter.AverageRating = { 
            $gte: ratingValue,
            $lt: nextRating
        };

        if (!popular) {
            defaultSort = "rating"; // If popular isn't applied, set rating as default sort
        }
    } 
    else if (minPrice || maxPrice) {
        filter.Price = {};  
        if (minPrice) filter.Price.$gte = parseFloat(minPrice);
        if (maxPrice) filter.Price.$lte = parseFloat(maxPrice);

        if (!popular && !rating) {
            defaultSort = "price"; // If neither popular nor rating are set, sort by price
        }
    }

    // 📌 Use the default sorting if sortBy is not provided
    sortBy = sortBy || defaultSort;

    // 📌 Sorting logic
    const sortOrder = order === "asc" ? 1 : -1;
    if (sortBy === "price") {
        sortCriteria.Price = sortOrder;
    } else if (sortBy === "rating") {
        sortCriteria.AverageRating = sortOrder;
    } else if (sortBy === "popular") {
        sortCriteria.Views = sortOrder;
    }

    // 📌 Convert pagination values
    const limitNum = parseInt(limit);

    // 📌 Cursor-based Pagination
    if (cursor) {
        filter._id = { $gt: cursor }; 
    }

    console.log(filter, sortCriteria);

    return { filter, sortCriteria, limitNum };
};

module.exports = { updatePopularProducts, getProductFilters};