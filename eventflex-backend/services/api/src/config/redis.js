'use strict';
const Redis = require('ioredis');
const config = require('./index');
const { logger } = require('../utils/logger');

let redisClient = null;

const getRedisClient = () => {
  if (!redisClient) {
    redisClient = new Redis(config.redisUrl, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        logger.warn(`Redis retry attempt ${times}, delay: ${delay}ms`);
        return delay;
      },
    });

    redisClient.on('connect', () => logger.info('Redis connected successfully'));
    redisClient.on('error', (err) => logger.error('Redis error:', err));
    redisClient.on('close', () => logger.warn('Redis connection closed'));
  }
  return redisClient;
};

const redis = getRedisClient();

module.exports = redis;
