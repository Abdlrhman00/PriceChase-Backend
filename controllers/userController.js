const User = require("../models/user");
const bcrypt = require("bcrypt");
const path = require("path");
const clearCookies = require("../utils/clearCookies");
const deleteProfilePhoto = require("../utils/deleteProfilePhoto");
const sendError = require("../utils/sendError");
const sendEmail = require("../utils/sendEmail");
const generateAndSetTokens = require("../utils/generateAndSetTokens ");

exports.Signup = async (req, res, next) => {
  const { email, password, firstName, lastName } = req.body;
  const oldUser = await User.findOne({ email });

  if (oldUser) {
    // Delete the uploaded photo if it exists
    if (req.file) {
      const filePath = path.join(__dirname, "..", "uploads", req.file.filename);
      deleteProfilePhoto(filePath);
    }

    return next(sendError(409, "userExists"));
  }

  if (!email || !password || !firstName || !lastName)
    return next(sendError(400, "missingFields"));

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

  // Generate and set tokens
  await generateAndSetTokens(newuser, res);

  return res.status(201).json({
    message: "User successfully registered",
    data: {
      firstName,
      lastName,
      email,
      profilePhoto,
    },
  });
};

exports.Login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) return next(sendError(400, "missingFields"));

  const user = await User.findOne({ email });

  if (!user) return next(sendError(404, "user"));

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) return next(sendError(401));

  // Generate and set tokens
  await generateAndSetTokens(user, res);

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
};

exports.GetAccountData = async (req, res, next) => {
  const userId = req.user.id;

  if (!userId) {
    return next(sendError(404, "user"));
  }

  const user = await User.findById(userId).select(
    "firstName lastName email profilePhoto"
  );

  if (!user) return next(sendError(404, "user"));

  return res.status(200).json({
    data: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      profilePhoto: user.profilePhoto,
    },
  });
};

exports.UpdateAccount = async (req, res, next) => {
  const { firstName, lastName, email } = req.body;
  const userId = req.user.id;

  if (!userId) return next(sendError(404, "user"));
  const user = await User.findById(userId);

  if (!user) return next(sendError(404, "user"));

  // Validate email uniqueness
  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) return next(sendError(409, "emailExists"));
    user.email = email;
  }

  // Update fields only if provided
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;

  if (req.file) {
    const newPhotoPath = req.file.filename;

    // Check if photo is not the default
    if (
      user.profilePhoto &&
      user.profilePhoto !== "uploads/profile_photo.jpg"
    ) {
      const oldPhotoPath = path.join(
        __dirname,
        "..",
        "uploads",
        user.profilePhoto
      );
      deleteProfilePhoto(oldPhotoPath); // Delete the old photo
    }
    user.profilePhoto = newPhotoPath;
  }

  await user.save();
  return res.status(200).json({
    message: "Account successfully updated",
    data: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      profilePhoto: user.profilePhoto,
    },
  });
};

exports.DeleteAccount = async (req, res, next) => {
  const userId = req.user.id;

  if (!userId) return next(sendError(404, "user"));

  const user = await User.findById(userId);

  if (!user) return next(sendError(404, "user"));

  // If the user has a profile photo and it's not the default one, delete it from the filesystem
  if (user.profilePhoto && user.profilePhoto !== "uploads/profile_photo.jpg") {
    const oldPhotoPath = path.join(
      __dirname,
      "..",
      "uploads",
      user.profilePhoto
    );
    deleteProfilePhoto(oldPhotoPath);
  }

  // Clear authentication cookies
  clearCookies(res);

  await User.findByIdAndDelete(userId);

  return res.status(200).json({
    message: "Account successfully deleted",
  });
};

exports.ChangePassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  if (!userId) return next(sendError(404, "user"));

  const user = await User.findById(userId);

  if (!user) return next(sendError(404, "user"));

  // Check if the current password is correct
  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) return next(sendError(401, "currentPassword"));

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedNewPassword;

  clearCookies(res);
  user.refreshTokens = []; // Invalidate all sessions

  await user.save();

  await sendEmail(
    user.email,
    "Password Change Notification",
    "Your password has been successfully changed.",
    "<b>Your password has been successfully changed.</b>"
  );

  return res.status(200).json({
    message: "Password updated, please log in again.",
  });
};

exports.Logout = async (req, res, next) => {
  const userId = req.user.id;

  if (!userId) return next(sendError(404, "user"));

  const user = await User.findById(userId);

  if (!user) return next(sendError(404, "user"));

  // Clear the refresh tokens array
  user.refreshTokens = [];
  await user.save();

  // Clear authentication cookies
  clearCookies(res);

  return res.status(200).json({
    message: "Successfully logged out",
  });
};
