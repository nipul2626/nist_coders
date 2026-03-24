'use strict';
require('dotenv').config();

const requiredEnvVars = [
  'DATABASE_URL',
  'REDIS_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
];

// Validate required env vars on startup
const missing = requiredEnvVars.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`[Config] Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3001,
  wsPort: parseInt(process.env.WS_PORT, 10) || 3002,

  // Database
  databaseUrl: process.env.DATABASE_URL,
  directUrl: process.env.DIRECT_URL,

  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  redisSessionTtl: parseInt(process.env.REDIS_SESSION_TTL, 10) || 604800,

  // JWT
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // OAuth
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/v1/auth/google/callback',
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      callbackUrl: process.env.GITHUB_CALLBACK_URL || 'http://localhost:3001/api/v1/auth/github/callback',
    },
  },

  // Frontend
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  allowedOrigins: process.env.ALLOWED_ORIGINS || 'http://localhost:3000',

  // AWS S3
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'us-east-1',
    s3BucketName: process.env.AWS_S3_BUCKET_NAME || '',
    s3Url: process.env.AWS_S3_URL || '',
    cloudfrontUrl: process.env.AWS_CLOUDFRONT_URL || '',
  },

  // Stripe
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  },

  // SendGrid
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY || '',
    fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@eventflex.com',
    fromName: process.env.SENDGRID_FROM_NAME || 'EventFlex',
    templates: {
      welcome: process.env.SENDGRID_TEMPLATE_WELCOME || '',
      verifyEmail: process.env.SENDGRID_TEMPLATE_VERIFY_EMAIL || '',
      resetPassword: process.env.SENDGRID_TEMPLATE_RESET_PASSWORD || '',
      registrationConfirmed: process.env.SENDGRID_TEMPLATE_REGISTRATION_CONFIRMED || '',
      eventReminder: process.env.SENDGRID_TEMPLATE_EVENT_REMINDER || '',
      teamInvite: process.env.SENDGRID_TEMPLATE_TEAM_INVITE || '',
      paymentReceipt: process.env.SENDGRID_TEMPLATE_PAYMENT_RECEIPT || '',
      refundConfirmed: process.env.SENDGRID_TEMPLATE_REFUND_CONFIRMED || '',
      certificateReady: process.env.SENDGRID_TEMPLATE_CERTIFICATE_READY || '',
      eventUpdate: process.env.SENDGRID_TEMPLATE_EVENT_UPDATE || '',
      waitlistAvailable: process.env.SENDGRID_TEMPLATE_WAITLIST_AVAILABLE || '',
    },
  },

  // OpenAI
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
  },

  // AI Service
  aiService: {
    url: process.env.AI_SERVICE_URL || 'http://localhost:8000',
    secret: process.env.AI_SERVICE_SECRET || 'internal-secret',
  },

  // Sentry
  sentryDsn: process.env.SENTRY_DSN || '',

  // App
  appUrl: process.env.APP_URL || 'http://localhost:3001',
  appName: process.env.APP_NAME || 'EventFlex',
  maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 5,
  maxDocSizeMb: parseInt(process.env.MAX_DOC_SIZE_MB, 10) || 10,

  // Rate Limiting
  rateLimit: {
    auth: {
      max: parseInt(process.env.RATE_LIMIT_AUTH_MAX, 10) || 5,
      windowMs: parseInt(process.env.RATE_LIMIT_AUTH_WINDOW_MS, 10) || 900000,
    },
    api: {
      max: parseInt(process.env.RATE_LIMIT_API_MAX, 10) || 100,
      windowMs: parseInt(process.env.RATE_LIMIT_API_WINDOW_MS, 10) || 900000,
    },
    payment: {
      max: parseInt(process.env.RATE_LIMIT_PAYMENT_MAX, 10) || 10,
      windowMs: parseInt(process.env.RATE_LIMIT_PAYMENT_WINDOW_MS, 10) || 3600000,
    },
    ai: {
      max: parseInt(process.env.RATE_LIMIT_AI_MAX, 10) || 20,
      windowMs: parseInt(process.env.RATE_LIMIT_AI_WINDOW_MS, 10) || 3600000,
    },
  },

  // Security
  encryptionKey: process.env.ENCRYPTION_KEY || '',
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12,

  // Tokens
  emailVerificationExpiresHours: parseInt(process.env.EMAIL_VERIFICATION_EXPIRES_HOURS, 10) || 24,
  passwordResetExpiresHours: parseInt(process.env.PASSWORD_RESET_EXPIRES_HOURS, 10) || 1,

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  logFormat: process.env.LOG_FORMAT || 'json',

  // Event
  defaultCurrency: process.env.DEFAULT_EVENT_CURRENCY || 'USD',
  maxTeamChatLength: parseInt(process.env.MAX_TEAM_CHAT_MESSAGE_LENGTH, 10) || 2000,
  maxExportRows: parseInt(process.env.MAX_REGISTRATION_EXPORT_ROWS, 10) || 10000,
};

module.exports = config;
