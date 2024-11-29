const User = require("../models/user");
const AppError = require("../utils/AppError");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const path = require("path");
const fs = require("fs");
const generateJWT = require("../utils/generateJWT");
const setCookie = require("../utils/setCookie");

exports.Signup = asyncHandler(async (req, res, next) => {
  const { email, password, firstName, lastName } = req.body;
  const oldUser = await User.findOne({ email });

  if (oldUser) {
    // Delete the uploaded photo if it exists
    if (req.file) {
      const filePath = path.join(__dirname, "..", "uploads", req.file.filename);
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

  const accessToken = await generateJWT(
    { email, id: newuser.id, role: newuser.role },
    "5m"
  );
  setCookie(res, "access_token", accessToken, 5 * 60 * 1000);
  const refreshToken = await generateJWT(
    { email, id: newuser.id, role: newuser.role },
    "7d"
  );
  setCookie(res, "refresh_token", refreshToken, 7 * 24 * 60 * 60 * 1000);
  const hashedToken = await bcrypt.hash(refreshToken, 10);

  newuser.refreshTokens.push({
    token: hashedToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 d from now
  });

  await newuser.save();

  return res.status(201).json({
    message: "User successfully registered",
    data: {
      firstName,
      lastName,
      email,
      profilePhoto,
    },
  });
});

exports.Login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError("Email and password are required", 400));

  const user = await User.findOne({ email });

  if (!user) return next(new AppError("User not found", 404));

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) return next(new AppError("Invalid email or password", 401));

  const accessToken = await generateJWT(
    { email, id: user.id, role: user.role },
    "5m"
  );
  setCookie(res, "access_token", accessToken, 5 * 60 * 1000);

  const refreshToken = await generateJWT(
    { email, id: user.id, role: user.role },
    "7d"
  );
  setCookie(res, "refresh_token", refreshToken, 7 * 24 * 60 * 60 * 1000);
  const hashedToken = await bcrypt.hash(refreshToken, 10);

  user.refreshTokens.push({
    token: hashedToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 d from now
  });

  await user.save();

  return res.status(200).json({
    message: "User successfully logged In",
    data: {
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profilePhoto: user.profilePhoto,
      },
    },
  });
});

exports.GetAccountData = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  const user = await User.findById(userId).select(
    "firstName lastName email profilePhoto"
  );

  if (!user) return next(new AppError("User not found", 404));

  return res.status(200).json({
    data: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      profilePhoto: user.profilePhoto,
    },
  });
});

/*





exports.Logout = async (req,res) => {

}
    


exports.UpdateAccount = async (req,res) => {

}


exports.DeleteAccount = async (req,res) => {

}

*/
