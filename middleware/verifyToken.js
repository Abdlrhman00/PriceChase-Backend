const User = require("../models/user");
const jwt = require("jsonwebtoken");
const setCookie = require("../utils/setCookie");
const AppError = require("../utils/AppError");
const generateJWT = require("../utils/generateJWT");
const validateRefreshToken = require("../utils/validateRefreshToken");
const sendUnauthorizedError = require("../utils/sendUnauthorizedError");

const verifyToken = async (req, res, next) => {
  const access_token = req.cookies.access_token;

  const refresh_token = req.cookies.refresh_token;

  if (!access_token) {
    // If no access token
    if (!refresh_token) return sendUnauthorizedError(next);

    try {
      const decodedRefreshToken = jwt.verify(
        refresh_token,
        process.env.JWT_SECRET_KEY
      );

      const user = await User.findById(decodedRefreshToken.id);

      if (!user) return sendUnauthorizedError(next);

      const isValid = await validateRefreshToken(refresh_token, user);

      if (!isValid) return sendUnauthorizedError(next);

      // Generate new access token
      const accessToken = await generateJWT(
        {
          email: decodedRefreshToken.email,
          id: decodedRefreshToken.id,
          role: decodedRefreshToken.role,
        },
        "5m"
      );

      // Attach user details to the request
      req.user = decodedRefreshToken;

      setCookie(res, "access_token", accessToken, 5 * 60 * 1000);
    } catch (err) {
      return sendUnauthorizedError(next);
    }
  } else {
    try {
      const decodedAccessToken = jwt.verify(
        access_token,
        process.env.JWT_SECRET_KEY
      );

      req.user = decodedAccessToken;
    } catch (err) {
      return sendUnauthorizedError(next);
    }
  }
  next();
};

module.exports = verifyToken;
