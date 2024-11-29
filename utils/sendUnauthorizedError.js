const AppError = require("../utils/AppError");

module.exports =  (next) => next(new AppError("Unauthorized. Please log in again", 401));
