// server.js

// Core Modules
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const path = require("path");
const cookieParser = require('cookie-parser');
const AppError = require("./utils/AppError");
const globalError = require("./middleware/errorMiddleware");
const fs = require("fs");
const Product = require("./models/product"); 
// Configuration
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const mongoURI = process.env.MONGODB_URI;
// Middleware

// CORS Configuration
const allowedOrigins = [
  "http://localhost:5000",
  "http://localhost:5173", // Local development
  "https://isharee-backend-production.up.railway.app", // Deployed frontend
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));
app.use(cookieParser());

// For profile photos
app.use('/uploads',express.static(path.join(__dirname,'uploads')));

// Database Connection
mongoose
  .connect(mongoURI, {
  })
  .then(() => {console.log("Connected to MongoDB")/*,insertProducts()*/})
  .catch((error) => console.error("MongoDB connection error:", error));


/*  const insertProducts = async () => {
    try {
      // Read JSON file
      const data = fs.readFileSync("product_info.json", "utf-8");
      const products = JSON.parse(data);
  
      // Insert products into the database
      await Product.insertMany(products);
      console.log("Products inserted successfully!");
    } catch (error) {
      console.error("Error inserting products:", error);
    } finally {
      mongoose.connection.close();
    }
  }; */

// Import Routes
//const authRoutes = require('./routes/authRoutes');
//const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require("./routes/categoryRoutes");
//const wishlistRoutes = require('./routes/wishlistRoutes');
const adminRoutes = require("./routes/adminRoutes");

const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");

const { error } = require("console");
// API Routes
//app.use('/auth', authRoutes);          // User authentication and profile management
//app.use('/products', productRoutes);    // Product management
app.use("/categories", categoryRoutes); // Category and Subcategory management
//app.use('/wishlist', wishlistRoutes);   // User wishlist handling
app.use("/admin", adminRoutes); // Admin-only endpoints (user management, product deletion, etc.)

app.use("/user", userRoutes);
app.use("/products", productRoutes);


// Handle any invalid route
app.all("*", (req, res, next) => {
  next(new AppError("Cannot find this route", 404));
});


// Error Handling Middleware
app.use(globalError);

// Server Start
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
