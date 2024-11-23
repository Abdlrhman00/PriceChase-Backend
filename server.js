// server.js

// Core Modules
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const path = require("path");
const AppError = require("./utils/AppError");
const globalError = require("./middleware/errorMiddleware");
// Configuration
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const mongoURI = process.env.MONGODB_URI;
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));

// For profile photos
app.use('/uploads',express.static(path.join(__dirname,'uploads')));

// Database Connection
mongoose
  .connect(mongoURI, {
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Import Routes
//const authRoutes = require('./routes/authRoutes');
//const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require("./routes/categoryRoutes");
//const wishlistRoutes = require('./routes/wishlistRoutes');
const adminRoutes = require("./routes/adminRoutes");

const userRoutes = require("./routes/userRoutes");
const { error } = require("console");
// API Routes
//app.use('/auth', authRoutes);          // User authentication and profile management
//app.use('/products', productRoutes);    // Product management
app.use("/categories", categoryRoutes); // Category and Subcategory management
//app.use('/wishlist', wishlistRoutes);   // User wishlist handling
app.use("/admin", adminRoutes); // Admin-only endpoints (user management, product deletion, etc.)

app.use("/user", userRoutes);


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
