const cron = require("node-cron");
const { updatePopularProducts } = require("../services/productService");

// Run every 6 hours
cron.schedule("0 */24 * * *", async () => {
    console.log("🔄 Running scheduled task: Update Popular Products...");
    await updatePopularProducts();
});
