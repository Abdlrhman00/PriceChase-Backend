// utils/elasticsearchHelpers.js
const { Client } = require("elasticsearch");
const fs = require('fs');
const Category = require('../models/category');  // Import Category model
const SubCategory = require('../models/subCategory');  // Import SubCategory model

const client = new Client({
  host: process.env.BONSAI_URI,
  auth: {
    username:  process.env.BONSAI_USERNAME,
    password:  process.env.BONSAI_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  }
});


const INDEX_NAME = 'products';

async function searchProduct(
  query,
  categoryName = null,
  subCategoryName = null,
  minPrice = null,
  maxPrice = null,
  minRating = null
) {
  query = query.trim().toLowerCase();
  if (!query) {
    console.log("Empty query. Please provide a search term.");
    return [];
  }

  // Fetch category and subcategory IDs from the DB
  let categoryId = null;
  let subCategoryId = null;

  if (categoryName) {
    const category = await Category.findOne({ name: categoryName }).exec();
    if (category) {
      categoryId = category._id;
    }
  }

  if (subCategoryName) {
    const subCategory = await SubCategory.findOne({ name: subCategoryName }).exec();
    if (subCategory) {
      subCategoryId = subCategory._id;
    }
  }

  const searchBody = {
    query: {
      bool: {
        must: [
          {
            bool: {
              should: [
                { match_phrase: { Title: { query, boost: 10 } } },
                {
                  match: {
                    Title: {
                      query,
                      operator: "and",
                      minimum_should_match: "100%",
                      boost: 5
                    }
                  }
                }
              ]
            }
          }
        ],
        filter: []
      }
    },
    sort: [{ Price: { order: 'asc' } }],
      size: 100 
  };

  // Use the fetched category and subcategory IDs in the Elasticsearch query
if (categoryName) {
  searchBody.query.bool.filter.push({ term: { "Category.keyword": categoryName } });
}
if (subCategoryName) {
  searchBody.query.bool.filter.push({ term: { "SubCategory.keyword": subCategoryName } });
}

  // Additional filters for price range and rating
  if (minPrice !== null || maxPrice !== null) {
    const range = {};
    if (minPrice !== null) range.gte = minPrice;
    if (maxPrice !== null) range.lte = maxPrice;
    searchBody.query.bool.filter.push({ range: { Price: range } });
  }
  if (minRating !== null) {
    searchBody.query.bool.filter.push({ range: { AverageRating: { gte: minRating } } });
  }

  try {
    const response = await client.search({
      index: INDEX_NAME,
      body: searchBody
    });

    // Support both response formats
    const hitsContainer = response.body?.hits || response.hits;
    if (!hitsContainer || !Array.isArray(hitsContainer.hits)) {
      console.error('Search error: Unexpected response format', response);
      return [];
    }

      const results = hitsContainer.hits.map(hit => ({
          _id: hit.id, // attach Elasticsearch ID
    ...hit._source
  }));

    return results;
  } catch (err) {
    console.error('Search error:', err.meta?.body?.error || err.message);
    return [];
  }
}

module.exports = { searchProduct };
