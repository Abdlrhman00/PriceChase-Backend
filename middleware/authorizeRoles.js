const AppError = require("../utils/AppError");

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError("This role is not authorized to perform this action", 403)
      );
    next();
  };
};
module.exports = authorizeRoles;
