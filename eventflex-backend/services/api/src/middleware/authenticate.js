'use strict';
const { verifyAccessToken } = require('../utils/jwt');
const redis = require('../config/redis');
const prisma = require('../config/prisma');
const { logger } = require('../utils/logger');

/**
 * authenticate middleware
 * Validates the JWT access token from Authorization header or cookie.
 * Attaches req.user with the full user record.
 */
const authenticate = async (req, res, next) => {
  try {
    let token;

    // 1. Check Authorization header (Bearer token)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // 2. Fall back to httpOnly cookie
    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'No authentication token provided',
      });
    }

    // 3. Verify JWT signature and expiry
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      const message = err.name === 'TokenExpiredError'
        ? 'Access token expired. Please refresh your token.'
        : 'Invalid access token.';
      return res.status(401).json({ success: false, error: 'Unauthorized', message });
    }

    // 4. Check if session is still valid in Redis (allows remote logout)
    const sessionKey = `session:${decoded.userId}:${decoded.jti || decoded.iat}`;
    const sessionExists = await redis.exists(sessionKey);
    if (sessionExists === 0) {
      // Session not tracked in Redis — still valid if token not expired
      // Redis session tracking is optional; skip if key not found
    }

    // 5. Check if user is blacklisted (logged out globally)
    const blacklisted = await redis.get(`blacklist:${token}`);
    if (blacklisted) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Token has been revoked. Please login again.',
      });
    }

    // 6. Fetch user from DB (ensures user still exists and is active)
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        avatarUrl: true,
        role: true,
        isActive: true,
        emailVerified: true,
        collegeName: true,
      },
    });

    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized', message: 'User not found.' });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Your account has been suspended. Contact support.',
      });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    logger.error('authenticate middleware error:', err);
    next(err);
  }
};

/**
 * optionalAuthenticate — same as authenticate but doesn't block unauthenticated requests
 */
const optionalAuthenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const hasToken = (authHeader && authHeader.startsWith('Bearer ')) || req.cookies?.accessToken;
  if (!hasToken) return next();
  return authenticate(req, res, next);
};

module.exports = { authenticate, optionalAuthenticate };
