'use strict';
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const config = require('./index');
const authService = require('../services/auth.service');
const { logger } = require('../utils/logger');

const configurePassport = (passport) => {
  // ── Google OAuth Strategy ──────────────────────────────────
  if (config.oauth.google.clientId) {
    passport.use(new GoogleStrategy(
      {
        clientID: config.oauth.google.clientId,
        clientSecret: config.oauth.google.clientSecret,
        callbackURL: config.oauth.google.callbackUrl,
        scope: ['profile', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await authService.handleOAuthLogin({
            provider: 'GOOGLE',
            providerUserId: profile.id,
            email: profile.emails[0].value,
            fullName: profile.displayName,
            avatarUrl: profile.photos[0]?.value || null,
            accessToken,
            refreshToken,
          });
          return done(null, user);
        } catch (err) {
          logger.error('Google OAuth error:', err);
          return done(err, null);
        }
      },
    ));
  }

  // ── GitHub OAuth Strategy ──────────────────────────────────
  if (config.oauth.github.clientId) {
    passport.use(new GitHubStrategy(
      {
        clientID: config.oauth.github.clientId,
        clientSecret: config.oauth.github.clientSecret,
        callbackURL: config.oauth.github.callbackUrl,
        scope: ['user:email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('GitHub account has no public email. Please add one.'), null);
          }
          const user = await authService.handleOAuthLogin({
            provider: 'GITHUB',
            providerUserId: profile.id.toString(),
            email,
            fullName: profile.displayName || profile.username,
            avatarUrl: profile.photos[0]?.value || null,
            accessToken,
            refreshToken: null,
          });
          return done(null, user);
        } catch (err) {
          logger.error('GitHub OAuth error:', err);
          return done(err, null);
        }
      },
    ));
  }

  // Serialize/deserialize (only needed for session-based OAuth redirect)
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const prisma = require('./prisma');
      const user = await prisma.user.findUnique({ where: { id } });
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};

module.exports = { configurePassport };
