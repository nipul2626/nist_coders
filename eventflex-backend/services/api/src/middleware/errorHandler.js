'use strict';
const { logger } = require('../utils/logger');
const config = require('../config');

/**
 * Global error handler middleware.
 * Translates various error types into consistent JSON responses.
 */
const errorHandler = (err, req, res, next) => {
  // Default values
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';
  let errorType = err.name || 'Error';

  // ── Prisma Errors ────────────────────────────────────────────
  if (err.code === 'P2002') {
    statusCode = 409;
    errorType = 'ConflictError';
    const field = err.meta?.target?.[0] || 'field';
    message = `A record with this ${field} already exists.`;
  } else if (err.code === 'P2025') {
    statusCode = 404;
    errorType = 'NotFoundError';
    message = err.meta?.cause || 'Record not found.';
  } else if (err.code === 'P2003') {
    statusCode = 400;
    errorType = 'RelationError';
    message = 'Related record not found.';
  } else if (err.code?.startsWith('P')) {
    statusCode = 400;
    errorType = 'DatabaseError';
    message = 'Database operation failed.';
  }

  // ── JWT Errors ────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired.';
  }

  // ── Zod Validation Errors ─────────────────────────────────────
  if (err.name === 'ZodError') {
    statusCode = 422;
    errorType = 'ValidationError';
    message = 'Request validation failed.';
    return res.status(422).json({
      success: false,
      error: errorType,
      message,
      details: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
    });
  }

  // ── Multer Errors ─────────────────────────────────────────────
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    errorType = 'FileTooLarge';
    message = `File too large. Maximum size is ${config.maxFileSizeMb}MB.`;
  }

  // ── CORS Error ────────────────────────────────────────────────
  if (message.startsWith('CORS policy:')) {
    statusCode = 403;
    errorType = 'CORSError';
  }

  // Log 5xx errors (don't log 4xx — those are client errors)
  if (statusCode >= 500) {
    logger.error('Server Error:', {
      error: errorType,
      message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      userId: req.user?.id,
    });
  }

  res.status(statusCode).json({
    success: false,
    error: errorType,
    message,
    ...(config.nodeEnv === 'development' && statusCode >= 500 ? { stack: err.stack } : {}),
  });
};

/**
 * Helper to create typed application errors
 */
class AppError extends Error {
  constructor(message, statusCode = 500, name = 'AppError') {
    super(message);
    this.statusCode = statusCode;
    this.name = name;
    Error.captureStackTrace(this, this.constructor);
  }
}

const createError = (message, statusCode, name) => new AppError(message, statusCode, name);

module.exports = errorHandler;
module.exports.AppError = AppError;
module.exports.createError = createError;
