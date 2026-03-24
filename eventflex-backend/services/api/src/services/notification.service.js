'use strict';
const prisma = require('../config/prisma');
const redis = require('../config/redis');
const { logger } = require('../utils/logger');

// WebSocket client for real-time delivery
let io = null;
const setIO = (ioInstance) => { io = ioInstance; };

/**
 * Send a notification to a user via all available channels:
 * 1. Store in database
 * 2. Real-time via WebSocket (if user online)
 * 3. Email (based on user preferences)
 */
const sendNotification = async (userId, type, { title, message, actionUrl = null, metadata = {} }) => {
  try {
    // 1. Store in database
    const notification = await prisma.notification.create({
      data: { userId, type, title, message, actionUrl, metadata },
    });

    // 2. Real-time delivery via WebSocket
    if (io) {
      io.to(`user:${userId}`).emit('notification:new', {
        id: notification.id,
        type,
        title,
        message,
        actionUrl,
        metadata,
        createdAt: notification.createdAt,
      });
    }

    // 3. Email notification (check user preferences)
    const shouldEmail = await shouldSendEmail(userId, type);
    if (shouldEmail) {
      const emailService = require('./email.service');
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, fullName: true },
      });
      if (user) {
        await emailService.queueEmail('eventUpdate', user.email, {
          userName: user.fullName,
          notificationTitle: title,
          notificationMessage: message,
          actionUrl,
        });
      }
    }

    return notification;
  } catch (err) {
    logger.error(`Error sending notification to ${userId}:`, err);
  }
};

/**
 * Mark a notification as read
 */
const markAsRead = async (notificationId, userId) => {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true, readAt: new Date() },
  });
};

/**
 * Mark all notifications as read for a user
 */
const markAllAsRead = async (userId) => {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
};

/**
 * Get notifications for a user
 */
const getUserNotifications = async (userId, { page = 1, limit = 20, unreadOnly = false } = {}) => {
  const skip = (page - 1) * limit;
  const where = { userId, ...(unreadOnly ? { isRead: false } : {}) };

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  return { notifications, total, unreadCount, page, limit };
};

// ── Internal ──────────────────────────────────────────────────

const shouldSendEmail = async (userId, type) => {
  const ALWAYS_EMAIL = ['REGISTRATION_CONFIRMED', 'PAYMENT_SUCCESS', 'CERTIFICATE_READY'];
  if (ALWAYS_EMAIL.includes(type)) return true;

  const prefs = await prisma.userPreferences.findUnique({ where: { userId } });
  if (!prefs || !prefs.emailNotifications) return false;
  if (prefs.notificationFrequency === 'DAILY_DIGEST' || prefs.notificationFrequency === 'WEEKLY_DIGEST') return false;
  return true;
};

module.exports = { sendNotification, markAsRead, markAllAsRead, getUserNotifications, setIO };
