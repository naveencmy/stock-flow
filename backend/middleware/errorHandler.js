/**
 * Centralized Error Handler Middleware
 * Catches all errors forwarded by asyncHandler or next(err).
 * Returns consistent JSON error responses.
 * Hides stack traces in production.
 */
const errorHandler = (err, req, res, next) => {
  // Use statusCode from service errors, then res.statusCode, fallback to 500
  let statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(statusCode).json({
      success: false,
      message: messages.join(', '),
      stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
  }

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue).join(', ');
    return res.status(statusCode).json({
      success: false,
      message: `Duplicate value for: ${field}`,
      stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
  }

  // Handle Mongoose bad ObjectId (CastError)
  if (err.name === 'CastError') {
    statusCode = 400;
    return res.status(statusCode).json({
      success: false,
      message: `Invalid ID: ${err.value}`,
      stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
  }

  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = errorHandler;
