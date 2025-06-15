const User = require("../models/user");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const path = require("path");
const clearCookies = require("../utils/clearCookies");
const deleteProfilePhoto = require("../utils/deleteProfilePhoto");
const sendError = require("../utils/sendError");
const sendVerificationLink = require("../utils/sendVerificationLink");
const validateUser = require("../utils/validateUser");
const cloudinaryDelete = require("../utils/cloudinaryDelete");
const sendEmail = require("../utils/sendEmail");
const generateAndSetTokens = require("../utils/generateAndSetTokens");
const verifyJWT = require("../utils/verifyJWT");
exports.signup = async (req, res, next) => {
  const { email, password, firstName, lastName } = req.body;
  const oldUser = await User.findOne({ email: email.toLowerCase() });

  if (oldUser) return next(sendError(409, "userExists"));

  const newUser = new User({
    firstName,
    lastName,
    email, // Hashed automatically by the pre-save hook
    password,
  });

  await newUser.save();
  sendVerificationLink(email, newUser.id);

  return res.status(201).json({
    message: "User registered! Please verify your email.",
    data: {
      firstName,
      lastName,
      email,
    },
  });
};

// Verify user's email
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query; // Get the token from the query parameter

    if (!token) return next(sendError(400, "noToken"));

    // Decode the JWT token and verify it
    const decoded = verifyJWT(token);

    const user = await User.findById(decoded.id); // Find the user by ID

    if (!user) return next(sendError(400, "invalidToken"));

    if (user.isVerified) return next(sendError(400, "alreadyVerified"));

    // Mark the user as verified
    user.isVerified = true;
    await user.save();

    res.status(200).json({ message: "Email verified successfully!" });
  } catch (err) {
    return next(sendError(400, "invalidToken"));
  }
};

exports.login = async (req, res, next) => {
  const userId = req.user?.id;

  if (userId) {
    return res.status(200).json({
      message: "User is already logged in.",
    });
  }

  const { email, password } = req.body;

  if (!email || !password) return next(sendError(400, "missingFields"));

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) return next(sendError(404, "user"));

  // Compare the password with the hashed password in the database
  const isMatch = await user.comparePassword(password);

  if (!isMatch) return next(sendError(401, "Invalidcardinalities"));

  if (!user.isVerified) return next(sendError(403, "verifyEmail"));

  // Generate and set tokens
  await generateAndSetTokens(user, res);

  const access_token = req.cookies.access_token;

  const refresh_token = req.cookies.refresh_token;

  return res.status(200).json({
    message: "User successfully logged In",
    data: {
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profilePicture: user.profilePicture.url,
        role: user.role
      },
    },
  });
};

exports.getAccountData = async (req, res, next) => {
  const userId = req.user.id;

  if (!userId) {
    return next(sendError(401));
  }

  const user = await User.findById(userId)
    .select("firstName lastName email profilePicture.url")
    .lean();

  if (!user) return next(sendError(404, "user"));

  return res.status(200).json({
    message: "User account data retrieved successfully.",
    data: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      profilePicture: user.profilePicture?.url,
    },
  });
};

exports.updateAccount = async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    profilePictureUrl,
    profilePicturePublic_id,
  } = req.body;
  const user = await validateUser(req, next);
  const duplicateUser = await User.findOne({ email });

  // Validate uniqueness
  if (duplicateUser && duplicateUser.id !== user._id) {
    if (duplicateUser.email === email)
      return next(sendError(409, "userExists"));
  }

  // Update fields only if provided

  if (email) user.email = email;

  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;

  if (profilePictureUrl) {
    const oldPublic_id = user.profilePicture.public_id;

    user.profilePicture.url = profilePictureUrl;
    user.profilePicture.public_id = profilePicturePublic_id;

    if (oldPublic_id !== process.env.DEFAULT_PROFILE_PICTURE_PUBLIC_ID) {
      await cloudinaryDelete(oldPublic_id); // Delete the old Picture
    }
  }

  await user.save();
  return res.status(200).json({
    message: "Account successfully updated",
    data: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      profilePhoto: user.profilePicture,
    },
  });
};

exports.changePassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user?.id;
  console.log(userId);

  if (!userId) return next(sendError(404, "user"));

  const session = await mongoose.startSession();
  session.startTransaction();
  const user = await User.findById(userId).session(session);
  if (!user) {
    await session.abortTransaction();
    session.endSession();
    return next(sendError(404, "user"));
  }

  // Check if the current password is correct
  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) {
    await session.abortTransaction();
    session.endSession();
    return next(sendError(401, "Current password is incorrect."));
  }

  // Update the password
  user.password = newPassword; // The pre("save") hook will hash this password

  // Clear all refresh tokens
  user.refreshTokens = [];

  // Save the user (this will trigger schema validation and password hashing)
  await user.save({ session });

  // Commit the transaction
  await session.commitTransaction();
  session.endSession();

  clearCookies(res);

  return res.status(200).json({
    message: "Password updated, please log in again.",
  });
};

exports.logout = async (req, res, next) => {
  const user = await validateUser(req, next);

  // Clear the refresh tokens array
  user.refreshTokens = [];
  await user.save();

  // Clear authentication cookies
  clearCookies(res);

  return res.status(200).json({
    message: "Successfully logged out",
  });
};

exports.deleteAccount = async (req, res, next) => {
  const user = await validateUser(req, next);

  const public_id = user.profilePicture.public_id;
  const defaultPicturePublicId = process.env.DEFAULT_PROFILE_PICTURE_PUBLIC_ID;

  // If the user has a profile photo and it's not the default one

  if (public_id !== defaultPicturePublicId) await cloudinaryDelete(public_id);

  // Clear authentication cookies
  clearCookies(res);

  await User.findByIdAndDelete(user._id);

  return res.status(200).json({
    message: "Account successfully deleted",
  });
};
