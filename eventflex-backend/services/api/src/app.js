'use strict';
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const swaggerUi = require('swagger-ui-express');

const { logger } = require('./utils/logger');
const { initSentry, sentryRequestHandler, sentryErrorHandler } = require('./config/sentry');
const { specs } = require('./config/swagger');
const { configurePassport } = require('./config/passport');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const config = require('./config');

// Initialize Sentry (must be first)
initSentry();

const app = express();

// ── Security Middleware ──────────────────────────────────────
app.use(sentryRequestHandler());
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false, // Handled separately
}));

// ── CORS ─────────────────────────────────────────────────────
const allowedOrigins = config.allowedOrigins.split(',').map(o => o.trim());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS policy: origin ${origin} is not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
  exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Per-Page'],
}));

// ── General Middleware ───────────────────────────────────────
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── HTTP Logging ─────────────────────────────────────────────
if (config.nodeEnv !== 'test') {
  app.use(morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) },
    skip: (req) => req.url === '/health',
  }));
}

// ── Passport (OAuth) ─────────────────────────────────────────
app.use(passport.initialize());
configurePassport(passport);

// ── Rate Limiting ────────────────────────────────────────────
app.use('/api/v1', apiLimiter);

// ── Swagger Docs ─────────────────────────────────────────────
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customSiteTitle: 'EventFlex API Docs',
  customCss: '.swagger-ui .topbar { display: none }',
}));

// ── Health Check ─────────────────────────────────────────────
app.get('/health', async (req, res) => {
  const { checkHealth } = require('./config/healthCheck');
  const health = await checkHealth();
  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});

// ── API Routes ───────────────────────────────────────────────
app.use('/api/v1', routes);

// ── 404 Handler ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.method} ${req.url} not found`,
  });
});

// ── Sentry Error Handler ─────────────────────────────────────
app.use(sentryErrorHandler());

// ── Global Error Handler ─────────────────────────────────────
app.use(errorHandler);

module.exports = app;
