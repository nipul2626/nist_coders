'use strict';
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authenticate');
const prisma = require('../config/prisma');
const qrCodeService = require('../services/qrCode.service');

// POST /registrations
router.post('/', authenticate, async (req, res, next) => {
  try {
    const paymentService = require('../services/payment.service');
    const { eventId, ticketTypeId, promoCode, teamId } = req.body;
    const result = await paymentService.createPaymentIntent({ userId: req.user.id, eventId, ticketTypeId, promoCode, teamId });
    res.status(201).json({ success: true, data: result });
  } catch (err) { next(err); }
});

// GET /registrations/my-registrations
router.get('/my-registrations', authenticate, async (req, res, next) => {
  try {
    const registrations = await prisma.registration.findMany({
      where: { userId: req.user.id },
      include: {
        event: { select: { id: true, title: true, startDate: true, endDate: true, bannerUrl: true, status: true } },
        ticketType: { select: { name: true, price: true } },
        team: { select: { id: true, name: true } },
        certificate: { select: { certificateUrl: true, certificateId: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: registrations });
  } catch (err) { next(err); }
});

// GET /registrations/:id
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const registration = await prisma.registration.findUnique({
      where: { id: req.params.id },
      include: {
        event: true,
        ticketType: true,
        user: { select: { id: true, fullName: true, email: true } },
        team: true,
        payments: true,
        certificate: true,
      },
    });
    if (!registration) return res.status(404).json({ success: false, error: 'NotFound', message: 'Registration not found.' });
    if (registration.userId !== req.user.id && !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Forbidden', message: 'Access denied.' });
    }
    res.json({ success: true, data: registration });
  } catch (err) { next(err); }
});

// PATCH /registrations/:id/cancel
router.patch('/:id/cancel', authenticate, async (req, res, next) => {
  try {
    const reg = await prisma.registration.findUnique({ where: { id: req.params.id } });
    if (!reg) return res.status(404).json({ success: false, error: 'NotFound', message: 'Registration not found.' });
    if (reg.userId !== req.user.id) return res.status(403).json({ success: false, error: 'Forbidden' });
    if (['CANCELLED', 'CHECKED_IN'].includes(reg.status)) {
      return res.status(400).json({ success: false, error: 'BadRequest', message: `Cannot cancel a ${reg.status.toLowerCase()} registration.` });
    }
    const updated = await prisma.registration.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED', cancelledAt: new Date(), cancellationReason: req.body.reason },
    });
    // Release ticket
    await prisma.ticketType.update({ where: { id: reg.ticketTypeId }, data: { quantitySold: { decrement: 1 } } });
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
});

// GET /registrations/:id/qr-code
router.get('/:id/qr-code', authenticate, async (req, res, next) => {
  try {
    const reg = await prisma.registration.findUnique({ where: { id: req.params.id } });
    if (!reg || reg.userId !== req.user.id) return res.status(403).json({ success: false, error: 'Forbidden' });
    if (reg.qrCodeUrl) return res.json({ success: true, data: { qrCodeUrl: reg.qrCodeUrl } });
    const qrUrl = await qrCodeService.generateRegistrationQR(reg);
    res.json({ success: true, data: { qrCodeUrl: qrUrl } });
  } catch (err) { next(err); }
});

module.exports = router;
