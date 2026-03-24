'use strict';
require('dotenv').config();

const app = require('./app');
const { logger } = require('./utils/logger');
const config = require('./config');

const PORT = config.port || 3001;

const server = app.listen(PORT, () => {
  logger.info(`🚀 EventFlex API running on port ${PORT} [${config.nodeEnv}]`);
  logger.info(`📚 Swagger docs: http://localhost:${PORT}/api/docs`);
  logger.info(`❤️  Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
const shutdown = (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });
  // Force exit after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
  process.exit(1);
});

module.exports = server;
