const User = require("../models/user");
const AppError = require("../utils/AppError");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const path = require("path");
const fs = require('fs');

//asyncHandler(
exports.Signup = asyncHandler(async (req, res, next) => {
  const { email, password, firstName, lastName } = req.body;
  const oldUser = await User.findOne({ email });

  if (oldUser) {

    // Delete the uploaded photo if it exists
    if (req.file) {
      const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);
      fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting file:", err.message);
      });
    }

    return next(new AppError("User already exists", 409));
  }

  if (!email || !password || !firstName || !lastName)
    return next(new AppError("All fields are required", 400));

  // encrypt the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // If the user uploads a photo take it otherwise take the default one
  console.log(req.file);
  const profilePhoto = req.file
    ? req.file.filename
    : "uploads/profile_photo.jpg";

  const newuser = new User({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    profilePhoto,
  });

  await newuser.save();

  return res.status(201).json({
    message: "User successfully registered",
    data: {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      profilePhoto,
    },
  });
});

exports.Login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ error: "User not fount" });

  const hashedPassword = await bcrypt.hash(password, 10);

  if (hashedPassword !== user.password)
    return res.status(401).json({ error: "Invalid email or password" });

  return res.status(200).json({ message: "User successfully registered" });
};

exports.GetAccountData = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) return res.status(404).json({ error: "User not found" });

  return res.status(200).json({
    message: "User is found",
    data: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    },
  });
};

/*





exports.Logout = async (req,res) => {

}
    


exports.UpdateAccount = async (req,res) => {

}


exports.DeleteAccount = async (req,res) => {

}

*/
 