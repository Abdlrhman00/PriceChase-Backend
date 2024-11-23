const globalError = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  // console.error(err.stack);
  res.status(err.statusCode).json({ error: err.message });
};
module.exports = globalError;