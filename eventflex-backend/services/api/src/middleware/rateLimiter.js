'use strict';
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('../config/redis');
const config = require('../config');

// Helper: create a Redis-backed rate limiter
const createLimiter = ({ windowMs, max, message, keyPrefix }) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too Many Requests', message },
    keyGenerator: (req) => {
      // Use user ID if authenticated, otherwise IP
      return req.user?.id ? `${keyPrefix}:user:${req.user.id}` : `${keyPrefix}:ip:${req.ip}`;
    },
    store: new RedisStore({
      sendCommand: (...args) => redis.call(...args),
      prefix: `rl:${keyPrefix}:`,
    }),
    skip: () => config.nodeEnv === 'test',
  });
};

// General API rate limiter
const apiLimiter = createLimiter({
  windowMs: config.rateLimit.api.windowMs,
  max: config.rateLimit.api.max,
  message: 'Too many requests. Please slow down.',
  keyPrefix: 'api',
});

// Strict auth limiter (login, register, forgot-password)
const authLimiter = createLimiter({
  windowMs: config.rateLimit.auth.windowMs,
  max: config.rateLimit.auth.max,
  message: 'Too many authentication attempts. Please try again in 15 minutes.',
  keyPrefix: 'auth',
});

// Payment limiter
const paymentLimiter = createLimiter({
  windowMs: config.rateLimit.payment.windowMs,
  max: config.rateLimit.payment.max,
  message: 'Too many payment requests. Please wait before trying again.',
  keyPrefix: 'payment',
});

// AI endpoints limiter (expensive operations)
const aiLimiter = createLimiter({
  windowMs: config.rateLimit.ai.windowMs,
  max: config.rateLimit.ai.max,
  message: 'AI quota exceeded. Please try again in an hour.',
  keyPrefix: 'ai',
});

// Search limiter
const searchLimiter = createLimiter({
  windowMs: config.rateLimit.api.windowMs,
  max: 50,
  message: 'Too many search requests.',
  keyPrefix: 'search',
});

module.exports = { apiLimiter, authLimiter, paymentLimiter, aiLimiter, searchLimiter };
