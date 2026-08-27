const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error({ err, path: req.path, method: req.method }, err.message);

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Something went wrong. Please try again.' : err.message;

  return res.status(statusCode).json({ message });
};  

module.exports = errorHandler;