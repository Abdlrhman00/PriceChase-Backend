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


const insertProdcuts = async(storeName) => {
    try {
        // Path to your scraped JSON file
        const jsonFilePath = path.join(__dirname, `../data/${storeName}_products.json`);

        // Read JSON File
        const rawData = fs.readFileSync(jsonFilePath);
        const products = JSON.parse(rawData);

        for (const scrapedProduct of products) {
            try {
                // Fetch Store ID
                const store = await Store.findOne({ StoreName: scrapedProduct.StoreName });
                if (!store) {
                    console.warn(`Store not found: ${scrapedProduct.StoreName}`);
                    continue;
                }
                console.log("Store: ", scrapedProduct.StoreName)

                // Fetch Category ID
                const category = await Category.findOne({ CategoryName: scrapedProduct.Category });
                if (!category) {
                    console.warn(`Category not found: ${scrapedProduct.Category}`);
                    continue;
                }
                console.log("Category: ", scrapedProduct.Category)

                // Fetch SubCategory ID
                const subCategoryList = await SubCategory.find({ SubCategoryName: scrapedProduct.SubCategory });
                let finalSubCategoryID = null;
                for (const subCategory of subCategoryList) {
                    if (category.SubCategoryIDs.some(subID => subID.equals(subCategory._id))) {
                        finalSubCategoryID = subCategory._id;
                        break;
                    }
                }

                if (!finalSubCategoryID) {
                    console.warn(`SubCategory not linked to Category: ${scrapedProduct.SubCategory}`);
                    continue;
                }
                console.log("SubCategory: ", scrapedProduct.SubCategory)

                // Prepare Product Data
                const productData = {
                    Title: scrapedProduct.Title,
                    Image: scrapedProduct.Image,
                    ProductPage: scrapedProduct.ProductPage,
                    AverageRating: scrapedProduct.AverageRating,
                    Price: scrapedProduct.Price,
                    Currency: scrapedProduct.Currency,
                    Description: scrapedProduct.Description,
                    Availability: scrapedProduct.Availability,
                    SubCategoryID: finalSubCategoryID,
                    CategoryID: category._id,
                    StoreID: store._id,
                    TopReviews: scrapedProduct.TopReviews,
                    Views: 0,
                    isPopular: false,
                    priceDrop: false
                };

                // Insert Product
                await Product.create(productData);
                console.log(`✅ Inserted: ${scrapedProduct.Title}`);
            } catch (err) {
                console.error(`❌ Error processing product: ${scrapedProduct.Title}`, err);
            }
        }

        console.log("✅ All products inserted successfully!");
    } catch (error) {
        console.error("❌ Error reading or inserting products:", error);
    }
}

module.exports = { updatePopularProducts, getProductFilters, insertProdcuts};