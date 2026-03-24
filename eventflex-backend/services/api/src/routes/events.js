'use strict';
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticate, optionalAuthenticate } = require('../middleware/authenticate');
const { authorize, isEventOrganizer, isPrimaryOrganizer } = require('../middleware/authorize');
const eventService = require('../services/event.service');
const prisma = require('../config/prisma');
const s3Service = require('../services/s3.service');
const xlsx = require('xlsx');
const { getPaginationParams, paginatedResponse } = require('../utils/pagination');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// GET /events — Public listing with filters
router.get('/', optionalAuthenticate, async (req, res, next) => {
  try {
    const { events, total, page, limit } = await eventService.listEvents(req.query, req.user?.id);
    res.json(paginatedResponse(events, total, page, limit));
  } catch (err) { next(err); }
});

// GET /events/featured
router.get('/featured', async (req, res, next) => {
  try {
    const events = await prisma.event.findMany({
      where: { isFeatured: true, status: 'PUBLISHED' },
      include: { ticketTypes: { where: { isActive: true }, take: 1, orderBy: { price: 'asc' } } },
      take: 6, orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: events });
  } catch (err) { next(err); }
});

// GET /events/trending
router.get('/trending', async (req, res, next) => {
  try {
    const events = await prisma.event.findMany({
      where: { status: 'PUBLISHED', startDate: { gte: new Date() } },
      orderBy: { viewCount: 'desc' },
      take: 10,
      include: { ticketTypes: { where: { isActive: true }, take: 1, orderBy: { price: 'asc' } } },
    });
    res.json({ success: true, data: events });
  } catch (err) { next(err); }
});

// GET /events/:id
router.get('/:id', optionalAuthenticate, async (req, res, next) => {
  try {
    const event = await eventService.getEvent(req.params.id, req.user?.id);
    res.json({ success: true, data: event });
  } catch (err) { next(err); }
});

// POST /events
router.post('/', authenticate, authorize(['ORGANIZER', 'ADMIN', 'SUPER_ADMIN']), async (req, res, next) => {
  try {
    const event = await eventService.createEvent(req.user.id, req.body);
    res.status(201).json({ success: true, data: event });
  } catch (err) { next(err); }
});

// PUT /events/:id
router.put('/:id', authenticate, isEventOrganizer, async (req, res, next) => {
  try {
    const event = await eventService.updateEvent(req.params.id, req.body);
    res.json({ success: true, data: event });
  } catch (err) { next(err); }
});

// DELETE /events/:id
router.delete('/:id', authenticate, isEventOrganizer, async (req, res, next) => {
  try {
    await eventService.deleteEvent(req.params.id);
    res.json({ success: true, message: 'Event deleted.' });
  } catch (err) { next(err); }
});

// PATCH /events/:id/publish
router.patch('/:id/publish', authenticate, isEventOrganizer, async (req, res, next) => {
  try {
    const event = await eventService.publishEvent(req.params.id);
    res.json({ success: true, data: event, message: 'Event submitted for approval.' });
  } catch (err) { next(err); }
});

// POST /events/:id/banner (upload banner image)
router.post('/:id/banner', authenticate, isEventOrganizer, upload.single('banner'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'BadRequest', message: 'No file uploaded.' });
    const url = await s3Service.uploadFile(req.file.buffer, 'banners', req.file.mimetype, req.file.originalname);
    const event = await prisma.event.update({ where: { id: req.params.id }, data: { bannerUrl: url } });
    res.json({ success: true, data: { bannerUrl: url } });
  } catch (err) { next(err); }
});

// POST /events/:id/duplicate
router.post('/:id/duplicate', authenticate, isEventOrganizer, async (req, res, next) => {
  try {
    const event = await eventService.duplicateEvent(req.params.id, req.user.id);
    res.status(201).json({ success: true, data: event });
  } catch (err) { next(err); }
});

// GET /events/:id/analytics
router.get('/:id/analytics', authenticate, isEventOrganizer, async (req, res, next) => {
  try {
    const analytics = await eventService.getEventAnalytics(req.params.id, req.query);
    res.json({ success: true, data: analytics });
  } catch (err) { next(err); }
});

// GET /events/:id/organizers
router.get('/:id/organizers', authenticate, async (req, res, next) => {
  try {
    const organizers = await prisma.eventOrganizer.findMany({
      where: { eventId: req.params.id },
      include: { user: { select: { id: true, fullName: true, email: true, avatarUrl: true } } },
    });
    res.json({ success: true, data: organizers });
  } catch (err) { next(err); }
});

// POST /events/:id/organizers
router.post('/:id/organizers', authenticate, isPrimaryOrganizer, async (req, res, next) => {
  try {
    const { userId, role = 'CO_ORGANIZER', permissions = [] } = req.body;
    const org = await prisma.eventOrganizer.create({
      data: { eventId: req.params.id, userId, role, permissions },
      include: { user: { select: { id: true, fullName: true, email: true } } },
    });
    res.status(201).json({ success: true, data: org });
  } catch (err) { next(err); }
});

// DELETE /events/:id/organizers/:userId
router.delete('/:id/organizers/:userId', authenticate, isPrimaryOrganizer, async (req, res, next) => {
  try {
    await prisma.eventOrganizer.deleteMany({ where: { eventId: req.params.id, userId: req.params.userId } });
    res.json({ success: true, message: 'Organizer removed.' });
  } catch (err) { next(err); }
});

// GET /events/:id/tickets
router.get('/:id/tickets', async (req, res, next) => {
  try {
    const tickets = await prisma.ticketType.findMany({
      where: { eventId: req.params.id, isActive: true, visibility: { not: 'HIDDEN' } },
      orderBy: { price: 'asc' },
    });
    res.json({ success: true, data: tickets });
  } catch (err) { next(err); }
});

// POST /events/:id/tickets
router.post('/:id/tickets', authenticate, isEventOrganizer, async (req, res, next) => {
  try {
    const ticket = await prisma.ticketType.create({ data: { ...req.body, eventId: req.params.id } });
    res.status(201).json({ success: true, data: ticket });
  } catch (err) { next(err); }
});

// PUT /events/:id/tickets/:ticketId
router.put('/:id/tickets/:ticketId', authenticate, isEventOrganizer, async (req, res, next) => {
  try {
    const ticket = await prisma.ticketType.update({ where: { id: req.params.ticketId }, data: req.body });
    res.json({ success: true, data: ticket });
  } catch (err) { next(err); }
});

// DELETE /events/:id/tickets/:ticketId
router.delete('/:id/tickets/:ticketId', authenticate, isEventOrganizer, async (req, res, next) => {
  try {
    await prisma.ticketType.update({ where: { id: req.params.ticketId }, data: { isActive: false } });
    res.json({ success: true, message: 'Ticket deactivated.' });
  } catch (err) { next(err); }
});

// GET /events/:id/registrations
router.get('/:id/registrations', authenticate, isEventOrganizer, async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const where = { eventId: req.params.id };
    const [registrations, total] = await Promise.all([
      prisma.registration.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
        include: { user: { select: { fullName: true, email: true, collegeName: true } }, ticketType: { select: { name: true } }, team: { select: { name: true } } },
      }),
      prisma.registration.count({ where }),
    ]);
    res.json(paginatedResponse(registrations, total, page, limit));
  } catch (err) { next(err); }
});

// GET /events/:id/registrations/export
router.get('/:id/registrations/export', authenticate, isEventOrganizer, async (req, res, next) => {
  try {
    const rows = await eventService.exportRegistrations(req.params.id);
    const ws = xlsx.utils.json_to_sheet(rows);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Registrations');
    const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="registrations-${req.params.id}.xlsx"`);
    res.send(buf);
  } catch (err) { next(err); }
});

// PATCH /events/:id/registrations/:regId/check-in
router.patch('/:id/registrations/:regId/check-in', authenticate, isEventOrganizer, async (req, res, next) => {
  try {
    const reg = await eventService.checkInAttendee(req.params.id, req.params.regId);
    res.json({ success: true, data: reg });
  } catch (err) { next(err); }
});

// GET /events/:id/reviews
router.get('/:id/reviews', async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const where = { eventId: req.params.id };
    const [reviews, total] = await Promise.all([
      prisma.eventFeedback.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
        include: { user: { select: { fullName: true, avatarUrl: true } } },
      }),
      prisma.eventFeedback.count({ where }),
    ]);
    res.json(paginatedResponse(reviews, total, page, limit));
  } catch (err) { next(err); }
});

// POST /events/:id/reviews
router.post('/:id/reviews', authenticate, async (req, res, next) => {
  try {
    const { rating, review, feedbackType = 'OVERALL', isAnonymous = false } = req.body;
    // Verify attendee
    const reg = await prisma.registration.findFirst({
      where: { eventId: req.params.id, userId: req.user.id, status: { in: ['CONFIRMED', 'CHECKED_IN'] } },
    });
    if (!reg) return res.status(403).json({ success: false, error: 'Forbidden', message: 'Only verified attendees can review.' });

    const feedback = await prisma.eventFeedback.upsert({
      where: { eventId_userId: { eventId: req.params.id, userId: req.user.id } },
      update: { rating, review, feedbackType, isAnonymous },
      create: { eventId: req.params.id, userId: req.user.id, rating, review, feedbackType, isAnonymous, isVerifiedAttendee: true },
    });
    res.status(201).json({ success: true, data: feedback });
  } catch (err) { next(err); }
});

module.exports = router;
