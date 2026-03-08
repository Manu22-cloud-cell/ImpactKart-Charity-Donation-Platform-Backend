const logger = require("../utils/logger");

module.exports = (err, req, res, next) => {

  const statusCode = err.statusCode || 500;

  const errorMessage = `${req.method} ${req.originalUrl} ${statusCode} - ${err.message}`;

  // Log error using Winston
  logger.error(`${errorMessage}\n${err.stack}`);

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error"
  });

};