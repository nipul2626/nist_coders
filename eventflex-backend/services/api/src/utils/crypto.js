'use strict';
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

/**
 * Encrypt sensitive data (OAuth tokens, etc.)
 */
const encrypt = (text) => {
  if (!config.encryptionKey || config.encryptionKey.length !== 32) {
    return text; // Passthrough if key not configured
  }
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(config.encryptionKey), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
};

/**
 * Decrypt sensitive data
 */
const decrypt = (encryptedText) => {
  if (!config.encryptionKey || !encryptedText.includes(':')) {
    return encryptedText;
  }
  const [ivHex, tagHex, encrypted] = encryptedText.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(config.encryptionKey), iv);
  decipher.setAuthTag(tag);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

/**
 * Generate a cryptographically secure random token
 */
const generateSecureToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Generate a UUID v4
 */
const generateUUID = () => uuidv4();

/**
 * Hash data with SHA-256 (for storing tokens safely)
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Generate a random 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = {
  encrypt,
  decrypt,
  generateSecureToken,
  generateUUID,
  hashToken,
  generateOTP,
};
