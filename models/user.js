const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const wishlistSchema = new mongoose.Schema({
  productID: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  addedDate: { type: Date, default: Date.now },
},{_id : false});

const refreshTokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
  issuedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
    minlength: [2, "First name must be at least 2 characters"],
    maxlength: [50, "First name must be at most 50 characters"],
    match: [/^[A-Za-z]+$/, "First name can only contain letters"],
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    minlength: [2, "Last name must be at least 2 characters"],
    maxlength: [50, "Last name must be at most 50 characters"],
    match: [/^[A-Za-z]+$/, "Last name can only contain letters"],
  },
  password: {
    type: String,
    required: true,
    minlength: [8, "Password must be at least 8 characters long."],
    validate: {
      validator: (value) =>
        validator.isStrongPassword(value, {
          minLength: 8,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        }),
      message:
        "Password must contain at least one lowercase, one uppercase, one number, and one special character.",
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: (value) => validator.isEmail(value), // Validate email format
      message: "Please provide a valid email address.",
    },
  },
  isVerified: { type: Boolean, default: false },
  profilePicture: {
    url: {
      type: String,
      maxlength: [
        255,
        "Profile picture URL should be less than 256 characters.",
      ],
      default:
        "https://res.cloudinary.com/dknokwido/image/upload/v1737968225/profilePicture/tdnvzliie0wty93ihodf.jpg",
    },
    public_id: {
      type: String,
      default: "profilePicture/tdnvzliie0wty93ihodf",
    },
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  wishlist: [wishlistSchema],
  refreshTokens: [refreshTokenSchema],
});

// Pre-save hook to automatically set the age group and hash the password
userSchema.pre("save", async function (next) {
  try {
    // Hash password if modified
    if (this.isModified("password")) {
      const hashedPassword = await bcrypt.hash(this.password, 10);
      this.password = hashedPassword;
    }

    next();
  } catch (err) {
    next(err); // Pass the error to the next middleware
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema, "User");
module.exports = User;
