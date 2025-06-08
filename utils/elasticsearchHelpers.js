// utils/elasticsearchHelpers.js
const client = require('./elasticsearchClient');
const INDEX_NAME = 'products';

module.exports = {
  indexProduct: async (product) => {
    try {
      await client.index({
        index: INDEX_NAME,
        id: product.id || product._id.toString(),
        document: {
          Sku:          product.Sku || '', // Default to empty string if not provided
          Title:        product.Title,
          StoreName:    product.StoreName,
          Category:     product.Category,
          SubCategory:  product.SubCategory,
          Price:        product.Price,
          Currency:     product.Currency,
          AverageRating: product.AverageRating,
          Description:  product.Description,
          Availability: product.Availability,
          ProductPage:  product.ProductPage,
          Image:        product.Image,
          createdAt:    product.createdAt,
          updatedAt:    product.updatedAt,
          TopReviews:   product.TopReviews, // Store reviews as an array
          Views:        product.Views || 0, // Default to 0 if not available
          isPopular:    product.isPopular || false, // Default to false
          priceDrop:    product.priceDrop || false, // Default to false
          hidden:       product.hidden || false // Default to false
        }
      });

      await client.indices.refresh({ index: INDEX_NAME });
      console.log(`[ES] Indexed product ${product.id || product._id}`);
    } catch (err) {
      console.error('[ES] Error indexing product:', err);
    }
  },

  updateProduct: async (productId, updatedData) => {
    try {
      await client.update({
        index: INDEX_NAME,
        id: productId.toString(),
        doc: updatedData
      });
      console.log(`[ES] Updated product ${productId}`);
    } catch (err) {
      console.error('[ES] Error updating product:', err);
    }
  },

  deleteProduct: async (productId) => {
    try {
      await client.delete({
        index: INDEX_NAME,
        id: productId.toString()
      });
      console.log(`[ES] Deleted product ${productId}`);
    } catch (err) {
      if (err.meta?.statusCode === 404) {
        console.warn(`[ES] Tried to delete non-existent product ${productId}`);
      } else {
        console.error('[ES] Error deleting product:', err);
      }
    }
  }
};
