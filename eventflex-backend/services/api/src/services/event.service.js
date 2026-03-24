'use strict';
const prisma = require('../config/prisma');
const redis = require('../config/redis');
const { ensureUniqueSlug } = require('../utils/slugify');
const { getPaginationParams } = require('../utils/pagination');
const { logger } = require('../utils/logger');
const notificationService = require('./notification.service');

const EVENT_CACHE_TTL = 300; // 5 minutes

/**
 * List events with filters, search, and pagination
 */
const listEvents = async (query, userId = null) => {
  const { page, limit, skip } = getPaginationParams(query);
  const {
    q, category, eventType, startDate, endDate,
    priceMin, priceMax, city, state, country, tags,
    sort = 'date', status = 'PUBLISHED',
  } = query;

  const where = {
    status,
    visibility: 'PUBLIC',
    ...(q && {
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { shortDescription: { contains: q, mode: 'insensitive' } },
        { tags: { has: q } },
      ],
    }),
    ...(category && { category }),
    ...(eventType && { eventType }),
    ...(city && { venueCity: { contains: city, mode: 'insensitive' } }),
    ...(state && { venueState: { contains: state, mode: 'insensitive' } }),
    ...(country && { venueCountry: { contains: country, mode: 'insensitive' } }),
    ...(startDate && { startDate: { gte: new Date(startDate) } }),
    ...(endDate && { endDate: { lte: new Date(endDate) } }),
    ...(tags && { tags: { hasSome: Array.isArray(tags) ? tags : [tags] } }),
    ...(priceMin !== undefined || priceMax !== undefined ? {
      ticketTypes: {
        some: {
          price: {
            ...(priceMin !== undefined ? { gte: parseFloat(priceMin) } : {}),
            ...(priceMax !== undefined ? { lte: parseFloat(priceMax) } : {}),
          },
        },
      },
    } : {}),
  };

  const orderBy = {
    date: { startDate: 'asc' },
    popular: { viewCount: 'desc' },
    newest: { createdAt: 'desc' },
    price: { ticketTypes: { _count: 'asc' } }, // Approximate; custom price sort done in app
  }[sort] || { startDate: 'asc' };

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        ticketTypes: { where: { isActive: true }, orderBy: { price: 'asc' }, take: 1 },
        organizers: {
          where: { role: 'PRIMARY_ORGANIZER' },
          include: { user: { select: { fullName: true, avatarUrl: true } } },
        },
        _count: { select: { registrations: true } },
      },
    }),
    prisma.event.count({ where }),
  ]);

  return { events, total, page, limit };
};

/**
 * Get a single event by ID or slug
 */
const getEvent = async (idOrSlug, userId = null) => {
  const cacheKey = `event:${idOrSlug}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const where = idOrSlug.includes('-') && !idOrSlug.match(/^[0-9a-f]{8}-[0-9a-f]{4}/)
    ? { slug: idOrSlug }
    : { id: idOrSlug };

  const event = await prisma.event.findFirst({
    where: { ...where, OR: [{ visibility: 'PUBLIC' }, { visibility: 'UNLISTED' }] },
    include: {
      ticketTypes: { where: { isActive: true }, orderBy: { price: 'asc' } },
      organizers: { include: { user: { select: { id: true, fullName: true, avatarUrl: true, email: true } } } },
      _count: { select: { registrations: true, savedBy: true } },
    },
  });

  if (!event) throw Object.assign(new Error('Event not found.'), { statusCode: 404 });

  // Increment view count (async, non-blocking)
  prisma.event.update({ where: { id: event.id }, data: { viewCount: { increment: 1 } } }).catch(() => {});

  await redis.setex(cacheKey, EVENT_CACHE_TTL, JSON.stringify(event));
  return event;
};

/**
 * Create a new event
 */
const createEvent = async (organizerId, data) => {
  const { title, ticketTypes: ticketData = [], ...eventData } = data;
  const slug = await ensureUniqueSlug(title, prisma);

  const event = await prisma.$transaction(async (tx) => {
    const newEvent = await tx.event.create({
      data: { ...eventData, title, slug, createdBy: organizerId, status: 'DRAFT' },
    });

    // Add creator as primary organizer
    await tx.eventOrganizer.create({
      data: { eventId: newEvent.id, userId: organizerId, role: 'PRIMARY_ORGANIZER' },
    });

    // Create ticket types if provided
    if (ticketData.length > 0) {
      await tx.ticketType.createMany({
        data: ticketData.map((t) => ({ ...t, eventId: newEvent.id })),
      });
    }

    return tx.event.findUnique({
      where: { id: newEvent.id },
      include: { ticketTypes: true, organizers: true },
    });
  });

  logger.info(`Event created: ${event.id} by ${organizerId}`);
  return event;
};

/**
 * Update event
 */
const updateEvent = async (eventId, data) => {
  const { ticketTypes, ...eventData } = data;

  // Clear cache
  await redis.del(`event:${eventId}`);

  const event = await prisma.event.update({
    where: { id: eventId },
    data: eventData,
    include: { ticketTypes: true, organizers: true },
  });

  return event;
};

/**
 * Delete event
 */
const deleteEvent = async (eventId) => {
  await prisma.event.delete({ where: { id: eventId } });
  await redis.del(`event:${eventId}`);
  logger.info(`Event deleted: ${eventId}`);
};

/**
 * Publish event (submit for approval)
 */
const publishEvent = async (eventId) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw Object.assign(new Error('Event not found.'), { statusCode: 404 });
  if (event.status === 'PUBLISHED') throw Object.assign(new Error('Event is already published.'), { statusCode: 400 });
  if (event.status === 'CANCELLED') throw Object.assign(new Error('Cannot publish a cancelled event.'), { statusCode: 400 });

  const updated = await prisma.event.update({
    where: { id: eventId },
    data: { status: 'PENDING_APPROVAL' },
  });
  await redis.del(`event:${eventId}`);
  return updated;
};

/**
 * Duplicate event (create a copy as draft)
 */
const duplicateEvent = async (eventId, organizerId) => {
  const original = await prisma.event.findUnique({
    where: { id: eventId },
    include: { ticketTypes: true },
  });
  if (!original) throw Object.assign(new Error('Event not found.'), { statusCode: 404 });

  const { id, slug, createdAt, updatedAt, viewCount, status, ...eventData } = original;
  const newSlug = await ensureUniqueSlug(`${original.title} copy`, prisma);

  const duplicate = await prisma.$transaction(async (tx) => {
    const newEvent = await tx.event.create({
      data: { ...eventData, slug: newSlug, status: 'DRAFT', viewCount: 0, createdBy: organizerId },
    });
    await tx.eventOrganizer.create({
      data: { eventId: newEvent.id, userId: organizerId, role: 'PRIMARY_ORGANIZER' },
    });
    if (original.ticketTypes.length > 0) {
      await tx.ticketType.createMany({
        data: original.ticketTypes.map(({ id: _, eventId: __, createdAt: _c, updatedAt: _u, quantitySold, ...t }) => ({
          ...t, eventId: newEvent.id, quantitySold: 0,
        })),
      });
    }
    return newEvent;
  });

  return duplicate;
};

/**
 * Get event analytics
 */
const getEventAnalytics = async (eventId, { startDate, endDate }) => {
  const where = {
    eventId,
    ...(startDate && endDate ? { date: { gte: new Date(startDate), lte: new Date(endDate) } } : {}),
  };

  const [analytics, registrations, revenue] = await Promise.all([
    prisma.analyticsEvent.findMany({ where, orderBy: { date: 'asc' } }),
    prisma.registration.count({ where: { eventId, status: { not: 'CANCELLED' } } }),
    prisma.registration.aggregate({
      where: { eventId, paymentStatus: 'PAID' },
      _sum: { amountPaid: true },
    }),
  ]);

  return {
    dailyStats: analytics,
    totalRegistrations: registrations,
    totalRevenue: revenue._sum.amountPaid || 0,
  };
};

/**
 * Export registrations as XLSX-compatible data
 */
const exportRegistrations = async (eventId) => {
  const registrations = await prisma.registration.findMany({
    where: { eventId },
    include: {
      user: { select: { fullName: true, email: true, collegeName: true, phoneNumber: true } },
      ticketType: { select: { name: true } },
      team: { select: { name: true } },
    },
    take: 10000,
  });

  return registrations.map((r) => ({
    'Registration #': r.registrationNumber,
    Name: r.user.fullName,
    Email: r.user.email,
    College: r.user.collegeName || '',
    Phone: r.user.phoneNumber || '',
    Ticket: r.ticketType.name,
    Team: r.team?.name || '',
    Status: r.status,
    'Payment Status': r.paymentStatus,
    'Amount Paid': r.amountPaid.toString(),
    'Registered At': r.createdAt.toISOString(),
    'Checked In': r.checkedInAt ? r.checkedInAt.toISOString() : 'No',
  }));
};

/**
 * Check-in attendee by registration ID
 */
const checkInAttendee = async (eventId, registrationId) => {
  const reg = await prisma.registration.findFirst({
    where: { id: registrationId, eventId },
  });
  if (!reg) throw Object.assign(new Error('Registration not found.'), { statusCode: 404 });
  if (reg.status === 'CHECKED_IN') throw Object.assign(new Error('Already checked in.'), { statusCode: 400 });
  if (reg.status !== 'CONFIRMED') throw Object.assign(new Error('Registration is not confirmed.'), { statusCode: 400 });

  return prisma.registration.update({
    where: { id: registrationId },
    data: { status: 'CHECKED_IN', checkedInAt: new Date() },
  });
};

module.exports = {
  listEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  publishEvent,
  duplicateEvent,
  getEventAnalytics,
  exportRegistrations,
  checkInAttendee,
};
