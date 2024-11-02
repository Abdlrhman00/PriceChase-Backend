// server.js

// Core Modules
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Configuration
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const mongoURI = proccess.env.MONGODB_URI
// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Database Connection
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("Connected to MongoDB"))
    .catch((error) => console.error("MongoDB connection error:", error));

// Import Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const adminRoutes = require('./routes/adminRoutes');

// API Routes
app.use('/auth', authRoutes);          // User authentication and profile management
app.use('/products', productRoutes);    // Product management
app.use('/categories', categoryRoutes); // Category and Subcategory management
app.use('/wishlist', wishlistRoutes);   // User wishlist handling
app.use('/admin', adminRoutes);         // Admin-only endpoints (user management, product deletion, etc.)

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "An unexpected error occurred." });
});

// Server Start
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});