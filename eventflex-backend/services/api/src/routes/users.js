'use strict';
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticate } = require('../middleware/authenticate');
const prisma = require('../config/prisma');
const s3Service = require('../services/s3.service');
const notificationService = require('../services/notification.service');
const { getPaginationParams, paginatedResponse } = require('../utils/pagination');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// GET /users/profile
router.get('/profile', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, email: true, username: true, fullName: true, avatarUrl: true,
        role: true, collegeName: true, graduationYear: true, department: true,
        skills: true, interests: true, emailVerified: true, phoneNumber: true,
        createdAt: true, lastLogin: true,
        preferences: true,
        _count: { select: { registrations: true, eventsCreated: true } },
      },
    });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
});

// PUT /users/profile
router.put('/profile', authenticate, async (req, res, next) => {
  try {
    const allowed = ['fullName', 'collegeName', 'graduationYear', 'department', 'skills', 'interests', 'phoneNumber'];
    const updateData = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
    const user = await prisma.user.update({ where: { id: req.user.id }, data: updateData });
    const { passwordHash, ...safe } = user;
    res.json({ success: true, data: safe });
  } catch (err) { next(err); }
});

// PUT /users/avatar
router.put('/avatar', authenticate, upload.single('avatar'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'BadRequest', message: 'No file uploaded.' });
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(req.file.mimetype)) return res.status(400).json({ success: false, error: 'BadRequest', message: 'Only JPEG, PNG, WebP allowed.' });

    const url = await s3Service.uploadFile(req.file.buffer, 'avatars', req.file.mimetype, req.file.originalname);
    await prisma.user.update({ where: { id: req.user.id }, data: { avatarUrl: url } });
    res.json({ success: true, data: { avatarUrl: url } });
  } catch (err) { next(err); }
});

// GET /users/preferences
router.get('/preferences', authenticate, async (req, res, next) => {
  try {
    const prefs = await prisma.userPreferences.findUnique({ where: { userId: req.user.id } });
    res.json({ success: true, data: prefs });
  } catch (err) { next(err); }
});

// PUT /users/preferences
router.put('/preferences', authenticate, async (req, res, next) => {
  try {
    const allowed = ['emailNotifications', 'smsNotifications', 'pushNotifications', 'newsletter', 'notificationFrequency', 'theme'];
    const data = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
    const prefs = await prisma.userPreferences.upsert({
      where: { userId: req.user.id },
      update: data,
      create: { userId: req.user.id, ...data },
    });
    res.json({ success: true, data: prefs });
  } catch (err) { next(err); }
});

// GET /users/notifications
router.get('/notifications', authenticate, async (req, res, next) => {
  try {
    const { page, limit } = getPaginationParams(req.query);
    const unreadOnly = req.query.unreadOnly === 'true';
    const result = await notificationService.getUserNotifications(req.user.id, { page, limit, unreadOnly });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
});

// PUT /users/notifications/:id/read
router.put('/notifications/:id/read', authenticate, async (req, res, next) => {
  try {
    await notificationService.markAsRead(req.params.id, req.user.id);
    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (err) { next(err); }
});

// PUT /users/notifications/read-all
router.put('/notifications/read-all', authenticate, async (req, res, next) => {
  try {
    await notificationService.markAllAsRead(req.user.id);
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) { next(err); }
});

// DELETE /users/account
router.delete('/account', authenticate, async (req, res, next) => {
  try {
    await prisma.user.update({ where: { id: req.user.id }, data: { isActive: false } });
    res.json({ success: true, message: 'Account deactivated successfully.' });
  } catch (err) { next(err); }
});

module.exports = router;
