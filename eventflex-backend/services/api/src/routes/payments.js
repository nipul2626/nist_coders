'use strict';
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authenticate');
const { paymentLimiter } = require('../middleware/rateLimiter');
const paymentService = require('../services/payment.service');
const prisma = require('../config/prisma');
const config = require('../config');

// POST /payments/create-intent
router.post('/create-intent', authenticate, paymentLimiter, async (req, res, next) => {
  try {
    const { eventId, ticketTypeId, promoCode, teamId } = req.body;
    if (!eventId || !ticketTypeId) return res.status(422).json({ success: false, error: 'ValidationError', message: 'eventId and ticketTypeId are required.' });
    const result = await paymentService.createPaymentIntent({ userId: req.user.id, eventId, ticketTypeId, promoCode, teamId });
    res.status(201).json({ success: true, data: result });
  } catch (err) { next(err); }
});

// POST /payments/webhook — Stripe sends raw body; must skip JSON parsing
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res, next) => {
  try {
    const signature = req.headers['stripe-signature'];
    await paymentService.handleWebhook(req.body, signature);
    res.json({ received: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /payments/:id
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: req.params.id },
      include: { registration: { select: { userId: true, eventId: true } } },
    });
    if (!payment) return res.status(404).json({ success: false, error: 'NotFound', message: 'Payment not found.' });
    if (payment.registration.userId !== req.user.id && !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Forbidden', message: 'Access denied.' });
    }
    res.json({ success: true, data: payment });
  } catch (err) { next(err); }
});

// POST /payments/:id/refund
router.post('/:id/refund', authenticate, async (req, res, next) => {
  try {
    const { reason = 'Refund requested' } = req.body;
    const refund = await paymentService.processRefund(req.params.id, reason, req.user.id);
    res.json({ success: true, data: refund, message: 'Refund initiated.' });
  } catch (err) { next(err); }
});

module.exports = router;
