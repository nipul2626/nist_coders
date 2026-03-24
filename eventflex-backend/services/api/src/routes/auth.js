'use strict';
const express = require('express');
const router = express.Router();
const passport = require('passport');
const authService = require('../services/auth.service');
const { authenticate } = require('../middleware/authenticate');
const { authLimiter } = require('../middleware/rateLimiter');
const config = require('../config');

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register new user
 *     tags: [Auth]
 */
router.post('/register', authLimiter, async (req, res, next) => {
  try {
    const { email, password, username, fullName, collegeName, graduationYear, department } = req.body;
    if (!email || !password || !username || !fullName) {
      return res.status(422).json({ success: false, error: 'ValidationError', message: 'email, password, username, and fullName are required.' });
    }
    if (password.length < 8) {
      return res.status(422).json({ success: false, error: 'ValidationError', message: 'Password must be at least 8 characters.' });
    }
    const result = await authService.register({ email, password, username, fullName, collegeName, graduationYear, department });
    res.status(201).json({ success: true, message: 'Registration successful. Please check your email to verify your account.', data: result });
  } catch (err) { next(err); }
});

router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(422).json({ success: false, error: 'ValidationError', message: 'Email and password are required.' });
    const result = await authService.login({ email, password });
    // Set HTTP-only cookies
    res.cookie('accessToken', result.accessToken, { httpOnly: true, secure: config.nodeEnv === 'production', sameSite: 'strict', maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', result.refreshToken, { httpOnly: true, secure: config.nodeEnv === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

router.post('/logout', authenticate, async (req, res, next) => {
  try {
    await authService.logout(req.user.id, req.token, req.cookies?.refreshToken);
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (err) { next(err); }
});

router.post('/refresh-token', async (req, res, next) => {
  try {
    const token = req.body.refreshToken || req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ success: false, error: 'Unauthorized', message: 'Refresh token required.' });
    const tokens = await authService.refreshToken(token);
    res.cookie('accessToken', tokens.accessToken, { httpOnly: true, secure: config.nodeEnv === 'production', sameSite: 'strict', maxAge: 15 * 60 * 1000 });
    res.json({ success: true, data: tokens });
  } catch (err) { next(err); }
});

router.post('/verify-email/:token', async (req, res, next) => {
  try {
    const result = await authService.verifyEmail(req.params.token);
    res.json({ success: true, message: 'Email verified successfully.', data: result });
  } catch (err) { next(err); }
});

router.post('/resend-verification', authLimiter, async (req, res, next) => {
  try {
    await authService.resendVerification(req.body.email);
    res.json({ success: true, message: 'If this email exists, a verification link has been sent.' });
  } catch (err) { next(err); }
});

router.post('/forgot-password', authLimiter, async (req, res, next) => {
  try {
    await authService.forgotPassword(req.body.email);
    res.json({ success: true, message: 'If this email exists, a password reset link has been sent.' });
  } catch (err) { next(err); }
});

router.post('/reset-password/:token', authLimiter, async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 8) return res.status(422).json({ success: false, error: 'ValidationError', message: 'New password must be at least 8 characters.' });
    await authService.resetPassword(req.params.token, password);
    res.json({ success: true, message: 'Password reset successfully. Please login.' });
  } catch (err) { next(err); }
});

// ── OAuth Routes ──────────────────────────────────────────────

router.get('/google', passport.authenticate('google', { session: false }));
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${config.frontendUrl}/auth/login?error=oauth_failed` }),
  (req, res) => {
    const { accessToken, refreshToken: rt } = req.user;
    res.cookie('accessToken', accessToken, { httpOnly: true, secure: config.nodeEnv === 'production', sameSite: 'strict', maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', rt, { httpOnly: true, secure: config.nodeEnv === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.redirect(`${config.frontendUrl}/dashboard`);
  }
);

router.get('/github', passport.authenticate('github', { session: false, scope: ['user:email'] }));
router.get('/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: `${config.frontendUrl}/auth/login?error=oauth_failed` }),
  (req, res) => {
    const { accessToken, refreshToken: rt } = req.user;
    res.cookie('accessToken', accessToken, { httpOnly: true, secure: config.nodeEnv === 'production', sameSite: 'strict', maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', rt, { httpOnly: true, secure: config.nodeEnv === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.redirect(`${config.frontendUrl}/dashboard`);
  }
);

router.get('/me', authenticate, (req, res) => {
  res.json({ success: true, data: req.user });
});

module.exports = router;
