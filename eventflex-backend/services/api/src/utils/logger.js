'use strict';
const winston = require('winston');
const config = require('../config');

const { combine, timestamp, errors, json, simple, colorize, printf } = winston.format;

const devFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack }) => {
    return stack
      ? `${ts} [${level}]: ${message}\n${stack}`
      : `${ts} [${level}]: ${message}`;
  }),
);

const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json(),
);

const logger = winston.createLogger({
  level: config.logLevel || 'info',
  format: config.logFormat === 'simple' ? devFormat : prodFormat,
  defaultMeta: { service: 'eventflex-api' },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
  silent: process.env.NODE_ENV === 'test',
});

module.exports = { logger };
