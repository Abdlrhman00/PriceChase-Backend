const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const Product = require('../models/product');
// const Category = require('../models/category');
// const Subcategory = require('../models/subCategory');
const User = require('../models/user');
const Store = require('../models/store');
const { indexProduct,updateProduct,deleteProduct } = require("../utils/elasticsearchHelpers");

// Create a new product
// exports.createProduct = async (req, res) => {
//     try {
//         const newProduct = await Product.create(req.body);
//         res.status(201).json(newProduct);
//     } catch (error) {
//         res.status(400).json({ message: 'Error creating product', error });
//     }
// };

exports.getAllProducts = async (req, res) => {
    try {
        const Products = await Product.find();
        if(!Products){
            return res.status(404).json({ message: 'No Products available' });
        }
        res.status(200).json({message:"Products fetched succesfully" ,Products});
    } catch (error) {
        res.status(400).json({ message: 'Error getting products', error });
    }
};

// Fetch new products
exports.fetchAndUpdateProducts = async (req, res) => {
    const storeName = req.params.storeName.toLowerCase();
    const filePath = path.join(__dirname, `../data/${storeName}_products.json`);

    try {
        const pyProcess = spawn("python3", [`./scraper/${storeName}_scraper.py`, storeName]);

        pyProcess.stdout.on("data", data => {
            console.log(`Python: ${data}`);
        });

        pyProcess.stderr.on("data", err => {
            console.error(`Python Error: ${err}`);
        });

        pyProcess.on("close", async code => {
            if (code !== 0) {
                return res.status(500).json({ message: "Python script failed." });
            }

            // Python done: Now read and process the JSON
            if (!fs.existsSync(filePath)) {
                return res.status(500).json({ message: "Scraped data file not found." });
            }

            const rawData = fs.readFileSync(filePath);
            const products = JSON.parse(rawData);

            let insertedCount = 0;
            for (const item of products) {
                try {
                    const store = await Store.findOne({ StoreName: item.StoreName });
                    const category = await Category.findOne({ CategoryName: item.Category });
                    const subCategory = await SubCategory.findOne({ SubcategoryName: item.SubCategory });

                    if (!store || !category || !subCategory) continue;

                    const existing = await Product.findOne({ Title: item.Title });

                    const productData = {
                        Title: item.Title,
                        Image: item.Image,
                        ProductPage: item.ProductPage,
                        AverageRating: item.AverageRating,
                        Price: item.Price,
                        Currency: item.Currency,
                        Description: item.Description,
                        Availability: item.Availability,
                        SubCategoryID: subCategory._id,
                        CategoryID: category._id,
                        StoreID: store._id,
                        TopReviews: item.TopReviews,
                        hidden: false,
                        Views: 0,
                        isPopular: false,
                        priceDrop: false
                    };

                    if (existing) {
                        await Product.updateOne({ _id: existing._id }, productData);
                    } else {
                        await Product.create(productData);
                    }

                    insertedCount++;
                } catch (err) {
                    console.error(`Error inserting product: ${item.Title}`, err);
                }
            }

            res.json({ message: `✅ ${insertedCount} products processed successfully.` });
        });
    } catch (err) {
        res.status(500).json({ error: "Something went wrong.", details: err.message });
    }
};


// Update a product
exports.updateProduct = async (req, res) => {
    const storeName = req.params.storeName.toLowerCase();
    const prodcutsNum = req.query.prodcutsNum

    console.log("number of prodcuts to update: ", prodcutsNum)

    console.log("Updating prodcuts", storeName)
    try {
        const store = await Store.findOne({ StoreName: storeName });
        if (!store) return res.status(404).json({ message: "Store not found." });

        const db_products = await Product.find({ StoreID: store._id });

        let insertedCount = 0;

        for (const product of db_products) {
            console.log("url: ", product.ProductPage)
            oldPrice = product.Price

            if (storeName == "walmart"){
                // Call Python script
                python_script = path.join(__dirname, `../scraper/${storeName}_scraper_one.py`)
                //console.log(python_script)
                const pyProcess = spawn("python", [python_script, product.ProductPage, product._id]);

                // Optional: log output for debugging
                pyProcess.stdout.on("data", data => console.log(`Python: ${data}`));
                pyProcess.stderr.on("data", err => console.error(`Python Error: ${err}`));

                // Wrap Python script execution in a Promise so we can `await` it
                const exitCode = await new Promise((resolve) => {
                    pyProcess.on("close", resolve);
                });

                if (exitCode !== 0) {
                    console.error(`Python script failed for product: ${product.Title}`);
                    continue;
                }
            }
            else{
                // Define the directory where the Scrapy project is located
                const scrapyProjectDir = path.join(__dirname, '../scraper/jumia'); // Modify this path as needed
                console.log(scrapyProjectDir)
                // Define the Scrapy command, assuming you're running the Scrapy project from its directory
                const pyProcess = spawn("scrapy", [
                    "crawl", 
                    `jumia_one_link`,  // Scrapy spider name
                    "-a", `url=${product.ProductPage}`,  // Pass URL dynamically
                    "-o", `../data/${product._id}product.json`  // Output file for scraped data
                ], {
                    cwd: scrapyProjectDir  // Set the working directory to your Scrapy project
                });
                // Command to run Scrapy spider
                //const pyProcess = spawn("scrapy", ["crawl", `${storeName}_one_link`, "-a", `url=${product.ProductPage}`, "-o product_info.json"]);

                // Optional: Log output for debugging
                pyProcess.stdout.on("data", data => console.log(`Scrapy: ${data}`));
                pyProcess.stderr.on("data", err => console.error(`Scrapy Error: ${err}`));

                // Wrap Scrapy spider execution in a Promise so we can await it
                const exitCode = await new Promise((resolve) => {
                    pyProcess.on("close", resolve);
                });

                // Handle error if Scrapy spider fails
                if (exitCode !== 0) {
                    console.error(`Scrapy spider failed for product: ${product.Title}`);
                    continue;
                }

                console.log("Scrapy spider ran successfully");
            }
            console.log("here")
            const filePath = path.join(__dirname, `../data/${product._id}_product.json`);
            //console.log(filePath)

            if (!fs.existsSync(filePath)) {
                console.warn(`JSON file not found: ${filePath}`);
                continue;
            }

            const rawData = fs.readFileSync(filePath);
            const products = JSON.parse(rawData);
            for (const item of products) {
                try {
                    //const category = await Category.findOne({ CategoryName: item.Category });
                    //const subCategory = await SubCategory.findOne({ SubcategoryName: item.SubCategory });

                    //if (!category || !subCategory) continue;

                    const existing = await Product.findOne({ Title: item.Title });

                    //if (!existing) continue;

                    const productData = {
                        Title: item.Title,
                        Sku: item.Id,
                        ProductPage: item.ProductPage,
                        AverageRating: item.AverageRating,
                        Price: item.Price,
                        Description: item.Description,
                        Availability: item.Availability,
                        TopReviews: item.TopReviews,
                    };  

                    if (item.Price < oldPrice){
                        productData["priceDrop"] = true
                    }else{
                        productData["priceDrop"] = false
                    }

                    await Product.updateOne({ _id: existing._id }, { $set: productData });
                    //print("Done")
                    insertedCount++;
                } catch (err) {
                    console.error(`Error updating product: ${item.Title}`, err);
                }
            }
            if (insertedCount == prodcutsNum){
                break;
            }
            
        }

        res.json({ message: `✅ ${insertedCount} products updated successfully.` });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Something went wrong.", details: err.message });
    }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if(!deletedProduct){
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ message: 'Product deleted succesfully' , deletedProduct});
    } catch (error) {
        res.status(400).json({ message: 'Error deleting product', error });
    }
};

// Hide a product
exports.hideProduct = async (req, res) => {
    try{
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        product.hidden = !product.hidden;
        await product.save();

        res.json({ message: `Product ${product.hidden ? "hidden" : "visible"} successfully` });
    } catch (error) {
        res.status(500).json({ error: "Error updating product visibility", details: error });
    }
}

// Get all usres
exports.getAllUsers = async (req, res) => {
    try {
        let {limit = 10, cursor=null} = req.query
        let filter = {}

        // 📌 Convert pagination values
        const limitNum = parseInt(limit);

        // 📌 Cursor-based Pagination
        if (cursor) {
            filter._id = { $gt: cursor }; 
        }

        //console.log(limitNum, cursor)

        const users = await User.find(filter).limit(limitNum + 1);

        let nextCursor = null;
        if (users.length > limitNum) {
            nextCursor = users[limitNum]._id;  // Set the next cursor to the last item of the current page
            users.pop();  // Remove the extra item to match the limit
        }
        
        if (!users.length) {
            return res.status(404).json({ message: "No users found" });
        }

        res.status(200).json({
        message: "Users fetched successfully",
        nextCursor,
        totalUsers: users.length,
        users,
        });

    } catch (error) {
        res.status(400).json({ message: 'Error getting users', error });
    }
};

// Delete a user
exports.deleteUser = async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if(!deletedUser){
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted succesfully' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting user', error });
    }
};

// Manually Trigger Popular Product Update (Admin Only)
exports.triggerPopularUpdate = async (req, res) => {
    try {
        await updatePopularProducts();
        res.json({ message: "Popular products updated successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error updating popular products" });
    }
};

// // Similarly, implement create, update, and delete for Categories and Subcategories
// exports.createCategory = async (req, res) => { /*...*/ };
// exports.updateCategory = async (req, res) => { /*...*/ };
// exports.deleteCategory = async (req, res) => { /*...*/ };

// exports.createSubcategory = async (req, res) => { /*...*/ };
// exports.updateSubcategory = async (req, res) => { /*...*/ };
// exports.deleteSubcategory = async (req, res) => { /*...*/ };