const AppError = require("./AppError");

const sendError = (statusCode, context = "") => {
  let message;

  switch (statusCode) {
    case 400:
      message =
        context === "missingFields"
          ? "All fields are required."
          : "Bad request.";
      break;
    case 401:
      if (context === "currentPassword") {
        message = "Current password is incorrect";
      } else {
        message = "Unauthorized. Please log in again.";
      }
      break;
    case 404:
      if (context === "user") {
        message = "User not found.";
      } else if (context === "resource") {
        message = "Resource not found.";
      } else {
        message = "Not found.";
      }
      break;
    case 409:
      message = context === "userExists" ? "User already exists." : "emailExists"? "Email already exists." :"Conflict.";
      break;
    default:
      message = "An error occurred.";
      break;
  }

  return new AppError(message, statusCode);
};

module.exports = sendError;
