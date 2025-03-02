const sendError = require("../utils/sendError");

// Define the required fields for each entity.
const requiredFieldsByEntity = {
  user: ["firstName","lastName", "email", "password"],

};

/**
 * Middleware factory: Returns a middleware that validates required fields for a given entity.
 */
const validateRequiredFields = (entityType) => {
  return (req, res, next) => {

    console.log(req.body);
    const requiredFields = requiredFieldsByEntity[entityType];

    // Check for missing fields
    const missingFields = requiredFields.filter((field) => {
      const value = req.body[field];

      return value === undefined || value === null || value === "";
    });

    if (missingFields.length > 0) {
      return next(sendError(400, "missingFields"));
    }

    next();
  };
};

module.exports = validateRequiredFields;
