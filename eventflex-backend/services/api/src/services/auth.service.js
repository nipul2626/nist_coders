'use strict';
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const prisma = require('../config/prisma');
const redis = require('../config/redis');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { generateSecureToken } = require('../utils/crypto');
const { logger } = require('../utils/logger');
const config = require('../config');
const emailService = require('./email.service');
const notificationService = require('./notification.service');

const TOKEN_PREFIX = 'refresh:';

/**
 * Register a new user with email/password
 */
const register = async ({ email, password, username, fullName, collegeName, graduationYear, department }) => {
  // Check duplicates
  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) throw Object.assign(new Error('Email already in use.'), { statusCode: 409 });

  const existingUsername = await prisma.user.findUnique({ where: { username } });
  if (existingUsername) throw Object.assign(new Error('Username already taken.'), { statusCode: 409 });

  // Hash password
  const passwordHash = await bcrypt.hash(password, config.bcryptSaltRounds);

  // Create user + preferences in a transaction
  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        email,
        passwordHash,
        username,
        fullName,
        collegeName,
        graduationYear,
        department,
        role: 'STUDENT',
      },
    });
    await tx.userPreferences.create({ data: { userId: newUser.id } });
    return newUser;
  });

  // Generate email verification token
  const verifyToken = generateSecureToken();
  const expiresAt = new Date(Date.now() + config.emailVerificationExpiresHours * 3600 * 1000);
  await prisma.emailVerificationToken.create({
    data: { userId: user.id, token: verifyToken, expiresAt },
  });

  // Queue welcome + verification email
  await emailService.queueEmail('welcome', user.email, {
    userName: user.fullName,
    verificationUrl: `${config.frontendUrl}/auth/verify-email?token=${verifyToken}`,
  });

  logger.info(`User registered: ${user.email}`);
  return { id: user.id, email: user.email, username: user.username, fullName: user.fullName };
};

/**
 * Login with email and password
 */
const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true, email: true, passwordHash: true, username: true,
      fullName: true, avatarUrl: true, role: true, isActive: true, emailVerified: true,
    },
  });

  if (!user || !user.passwordHash) {
    throw Object.assign(new Error('Invalid email or password.'), { statusCode: 401 });
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    logger.warn(`Failed login attempt for: ${email}`);
    throw Object.assign(new Error('Invalid email or password.'), { statusCode: 401 });
  }

  if (!user.isActive) {
    throw Object.assign(new Error('Account suspended. Contact support.'), { statusCode: 403 });
  }

  if (!user.emailVerified) {
    throw Object.assign(new Error('Please verify your email before logging in.'), {
      statusCode: 403, code: 'EMAIL_NOT_VERIFIED',
    });
  }

  const tokens = await generateTokens(user);
  await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });

  logger.info(`User logged in: ${user.email}`);
  return {
    user: sanitizeUser(user),
    ...tokens,
  };
};

/**
 * Handle OAuth login (Google / GitHub)
 */
const handleOAuthLogin = async ({ provider, providerUserId, email, fullName, avatarUrl, accessToken, refreshToken: oauthRefreshToken }) => {
  let user;

  // Check if OAuth account already linked
  const existingProvider = await prisma.oAuthProviderRecord.findUnique({
    where: { provider_providerUserId: { provider, providerUserId } },
    include: { user: true },
  });

  if (existingProvider) {
    user = existingProvider.user;
    // Update tokens
    await prisma.oAuthProviderRecord.update({
      where: { id: existingProvider.id },
      data: { accessToken, refreshToken: oauthRefreshToken },
    });
  } else {
    // Check if user exists with same email
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      // Link OAuth to existing account
      await prisma.oAuthProviderRecord.create({
        data: { userId: existingUser.id, provider, providerUserId, accessToken, refreshToken: oauthRefreshToken },
      });
      user = existingUser;
    } else {
      // Create new user
      const username = await generateUniqueUsername(email);
      user = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email,
            username,
            fullName,
            avatarUrl,
            emailVerified: true, // OAuth users are auto-verified
            role: 'STUDENT',
          },
        });
        await tx.oAuthProviderRecord.create({
          data: { userId: newUser.id, provider, providerUserId, accessToken, refreshToken: oauthRefreshToken },
        });
        await tx.userPreferences.create({ data: { userId: newUser.id } });
        return newUser;
      });

      // Send welcome email
      await emailService.queueEmail('welcome', user.email, { userName: user.fullName, verificationUrl: null });
    }
  }

  if (!user.isActive) throw Object.assign(new Error('Account suspended.'), { statusCode: 403 });

  await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });
  const tokens = await generateTokens(user);
  return { user: sanitizeUser(user), ...tokens };
};

/**
 * Verify email token
 */
const verifyEmail = async (token) => {
  const record = await prisma.emailVerificationToken.findUnique({ where: { token } });
  if (!record) throw Object.assign(new Error('Invalid verification token.'), { statusCode: 400 });
  if (record.expiresAt < new Date()) throw Object.assign(new Error('Verification token expired.'), { statusCode: 400 });

  const user = await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: record.userId }, data: { emailVerified: true } });
    await tx.emailVerificationToken.delete({ where: { id: record.id } });
    return tx.user.findUnique({ where: { id: record.userId } });
  });

  const tokens = await generateTokens(user);
  return { user: sanitizeUser(user), ...tokens };
};

/**
 * Resend email verification
 */
const resendVerification = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.emailVerified) return; // Silent — don't reveal if email exists

  // Delete old tokens
  await prisma.emailVerificationToken.deleteMany({ where: { userId: user.id } });

  const verifyToken = generateSecureToken();
  const expiresAt = new Date(Date.now() + config.emailVerificationExpiresHours * 3600 * 1000);
  await prisma.emailVerificationToken.create({
    data: { userId: user.id, token: verifyToken, expiresAt },
  });

  await emailService.queueEmail('verifyEmail', email, {
    userName: user.fullName,
    verificationUrl: `${config.frontendUrl}/auth/verify-email?token=${verifyToken}`,
  });
};

/**
 * Forgot password — send reset link
 */
const forgotPassword = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return; // Silent

  // Invalidate old tokens
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

  const resetToken = generateSecureToken();
  const expiresAt = new Date(Date.now() + config.passwordResetExpiresHours * 3600 * 1000);
  await prisma.passwordResetToken.create({
    data: { userId: user.id, token: resetToken, expiresAt },
  });

  await emailService.queueEmail('resetPassword', email, {
    userName: user.fullName,
    resetUrl: `${config.frontendUrl}/auth/reset-password?token=${resetToken}`,
    expiresIn: `${config.passwordResetExpiresHours} hour(s)`,
  });
};

/**
 * Reset password with token
 */
const resetPassword = async (token, newPassword) => {
  const record = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!record || record.used) throw Object.assign(new Error('Invalid or expired reset token.'), { statusCode: 400 });
  if (record.expiresAt < new Date()) throw Object.assign(new Error('Reset token expired.'), { statusCode: 400 });

  const passwordHash = await bcrypt.hash(newPassword, config.bcryptSaltRounds);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: record.userId }, data: { passwordHash } });
    await tx.passwordResetToken.update({ where: { id: record.id }, data: { used: true } });
  });

  // Invalidate all sessions for this user
  await invalidateAllUserSessions(record.userId);

  logger.info(`Password reset for userId: ${record.userId}`);
};

/**
 * Refresh access token using refresh token
 */
const refreshToken = async (token) => {
  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    throw Object.assign(new Error('Invalid refresh token.'), { statusCode: 401 });
  }

  // Check refresh token exists in Redis
  const storedToken = await redis.get(`${TOKEN_PREFIX}${decoded.userId}:${decoded.jti}`);
  if (!storedToken || storedToken !== token) {
    throw Object.assign(new Error('Refresh token revoked or invalid.'), { statusCode: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
  if (!user || !user.isActive) throw Object.assign(new Error('User not found.'), { statusCode: 401 });

  // Rotate refresh token (delete old, issue new)
  await redis.del(`${TOKEN_PREFIX}${decoded.userId}:${decoded.jti}`);
  const tokens = await generateTokens(user);
  return tokens;
};

/**
 * Logout — blacklist access token, delete refresh token from Redis
 */
const logout = async (userId, accessToken, refreshTokenStr) => {
  // Blacklist the access token in Redis (TTL = 15 min = token expiry)
  await redis.setex(`blacklist:${accessToken}`, 15 * 60, '1');

  // Remove all refresh tokens for this user
  const keys = await redis.keys(`${TOKEN_PREFIX}${userId}:*`);
  if (keys.length) await redis.del(...keys);

  logger.info(`User logged out: ${userId}`);
};

// ── Internal Helpers ─────────────────────────────────────────

const generateTokens = async (user) => {
  const jti = uuidv4();
  const payload = { userId: user.id, role: user.role, jti };

  const accessToken = generateAccessToken(payload);
  const refreshTokenStr = generateRefreshToken(payload);

  // Store refresh token in Redis (7 days TTL)
  await redis.setex(`${TOKEN_PREFIX}${user.id}:${jti}`, config.redisSessionTtl, refreshTokenStr);

  return { accessToken, refreshToken: refreshTokenStr };
};

const invalidateAllUserSessions = async (userId) => {
  const keys = await redis.keys(`${TOKEN_PREFIX}${userId}:*`);
  if (keys.length) await redis.del(...keys);
};

const sanitizeUser = (user) => {
  const { passwordHash, ...safe } = user;
  return safe;
};

const generateUniqueUsername = async (email) => {
  const base = email.split('@')[0].replace(/[^a-z0-9]/gi, '').toLowerCase().slice(0, 20);
  let username = base;
  let count = 0;
  while (await prisma.user.findUnique({ where: { username } })) {
    count++;
    username = `${base}${count}`;
  }
  return username;
};

module.exports = {
  register,
  login,
  handleOAuthLogin,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout,
};
