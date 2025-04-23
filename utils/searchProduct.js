const { Client } = require('@elastic/elasticsearch');
const fs = require('fs');

const client = new Client({ node: 'http://localhost:9200' });
const INDEX_NAME = 'products';

async function searchProduct(query, category = null, subcategory = null, minPrice = null, maxPrice = null, minRating = null) {
    query = query.trim().toLowerCase();
    if (!query) {
        console.log("Empty query. Please provide a search term.");
        return [];
    }

    const searchBody = {
        query: {
            bool: {
                must: [
                    {
                        bool: {
                            should: [
                                {
                                    match_phrase: {
                                        Title: {
                                            query: query,
                                            boost: 10
                                        }
                                    }
                                },
                                {
                                    match: {
                                        Title: {
                                            query: query,
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
        sort: [
            { Price: { order: 'asc' } }
        ],
        min_score: 1.0
    };

    if (category) {
        searchBody.query.bool.filter.push({ term: { "Category.keyword": category } });
    }

    if (subcategory) {
        searchBody.query.bool.filter.push({ term: { "SubCategory.keyword": subcategory } });
    }

    if (minPrice !== null || maxPrice !== null) {
        const priceRange = {};
        if (minPrice !== null) priceRange.gte = minPrice;
        if (maxPrice !== null) priceRange.lte = maxPrice;
        searchBody.query.bool.filter.push({ range: { Price: priceRange } });
    }

    if (minRating !== null) {
        searchBody.query.bool.filter.push({ range: { AverageRating: { gte: minRating } } });
    }

    try {
        const response = await client.search({
            index: INDEX_NAME,
            body: searchBody
        }); 

        const searchedList = response.hits.hits.map(hit => {
            const product = hit._source;
            console.log("Title:", product.Title);
            console.log("StoreName:", product.StoreName);
            console.log("Category:", product.Category); 
            console.log("SubCategory:", product.SubCategory);
            console.log("Price:", product.Price);
            console.log("AverageRating:", product.AverageRating);
            console.log("Description:", product.Description);
            console.log("Availability:", product.Availability);
            console.log("ProductPage:", product.ProductPage);
            console.log("Image:", product.Image);
            console.log('-'.repeat(40));

            return {
                Title: product.Title,
                StoreName: product.StoreName,
                Category: product.Category,
                SubCategory: product.SubCategory,
                Price: product.Price,
                AverageRating: product.AverageRating,
                Description: product.Description,
                Availability: product.Availability,
                ProductPage: product.ProductPage,
                Image: product.Image
            };
        });

        const outputFilename = `search_results_${query.replace(/ /g, "_")}.json`;
        fs.writeFileSync(outputFilename, JSON.stringify(searchedList, null, 2), 'utf8');
        console.log(`\nResults have been saved to ${outputFilename}`);

        return searchedList;

    } catch (error) {
        console.error('Search error:', error.meta?.body?.error || error.message);
    }
}

// Example usage
searchProduct("sneakers", null, null, 10, 100, 3.5);

module.exports = { searchProduct };
