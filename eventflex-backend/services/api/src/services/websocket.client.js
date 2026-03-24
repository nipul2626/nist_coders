'use strict';
/**
 * Thin WebSocket client for emitting events from the API service
 * to the WebSocket service via Redis pub/sub
 */
const redis = require('../config/redis');
const { logger } = require('../utils/logger');

const publish = (channel, data) => {
  try {
    redis.publish(channel, JSON.stringify(data));
  } catch (err) {
    logger.warn('WebSocket publish error (non-fatal):', err.message);
  }
};

const emitEventRegistration = (eventId) => {
  publish('ws:event:registration', { eventId });
};

const emitNotification = (userId, data) => {
  publish(`ws:notification:${userId}`, data);
};

const emitAnalyticsUpdate = (eventId, stats) => {
  publish(`ws:analytics:${eventId}`, stats);
};

const emitTeamMessage = (teamId, message) => {
  publish(`ws:team:message:${teamId}`, message);
};

module.exports = { emitEventRegistration, emitNotification, emitAnalyticsUpdate, emitTeamMessage };
