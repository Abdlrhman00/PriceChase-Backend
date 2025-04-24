const Product = require('../models/product'); // Assuming the Product model is here
const elasticsearchHelpers = require('./elasticsearchHelpers'); // Assuming your elasticsearchHelpers file is here

const indexAllProducts = async () => {
  try {
    // Fetch all products from the database
    const products = await Product.find();

    // Loop through each product and call indexProduct for each one
    for (const product of products) {
      await elasticsearchHelpers.indexProduct(product); // Send each product to the indexing function
      console.log(`Indexed product with ID: ${product._id}`);
    }
    console.log('All products have been indexed successfully.');
  } catch (err) {
    console.error('Error indexing products:', err);
  }
};

module.exports = indexAllProducts;
