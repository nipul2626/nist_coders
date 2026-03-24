'use strict';
const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Generate JWT access token (short-lived)
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
    issuer: 'eventflex',
    audience: 'eventflex-api',
  });
};

/**
 * Generate JWT refresh token (long-lived, stored in Redis)
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
    issuer: 'eventflex',
    audience: 'eventflex-api',
  });
};

/**
 * Verify access token
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, config.jwt.accessSecret, {
    issuer: 'eventflex',
    audience: 'eventflex-api',
  });
};

/**
 * Verify refresh token
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.jwt.refreshSecret, {
    issuer: 'eventflex',
    audience: 'eventflex-api',
  });
};

/**
 * Decode token without verifying (for expired token handling)
 */
const decodeToken = (token) => {
  return jwt.decode(token);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
};
