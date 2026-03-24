'use strict';
const Stripe = require('stripe');
const prisma = require('../config/prisma');
const redis = require('../config/redis');
const config = require('../config');
const { logger } = require('../utils/logger');
const emailService = require('./email.service');
const notificationService = require('./notification.service');
const qrCodeService = require('./qrCode.service');
const { generateRegistrationNumber } = require('../utils/slugify');

const stripe = new Stripe(config.stripe.secretKey);

/**
 * Create Stripe PaymentIntent and a pending registration
 */
const createPaymentIntent = async ({ userId, eventId, ticketTypeId, promoCode }) => {
  // Validate ticket type and availability
  const ticketType = await prisma.ticketType.findFirst({
    where: { id: ticketTypeId, eventId, isActive: true },
  });
  if (!ticketType) throw Object.assign(new Error('Ticket type not found or inactive.'), { statusCode: 404 });

  const available = ticketType.quantityTotal - ticketType.quantitySold;
  if (available <= 0) throw Object.assign(new Error('This ticket is sold out.'), { statusCode: 400 });

  // Check for duplicate registration
  const existingReg = await prisma.registration.findFirst({
    where: { userId, eventId, status: { not: 'CANCELLED' } },
  });
  if (existingReg) throw Object.assign(new Error('You are already registered for this event.'), { statusCode: 409 });

  // Apply promo code
  let discountAmount = 0;
  let promoCodeRecord = null;
  if (promoCode) {
    promoCodeRecord = await validatePromoCode(promoCode, eventId, ticketType.price);
    discountAmount = calculateDiscount(promoCodeRecord, ticketType.price);
  }

  const finalAmount = Math.max(0, parseFloat(ticketType.price) - discountAmount);
  const amountInCents = Math.round(finalAmount * 100);

  // Create registration (PENDING)
  const registrationNumber = generateRegistrationNumber();
  const registration = await prisma.registration.create({
    data: {
      userId,
      eventId,
      ticketTypeId,
      registrationNumber,
      status: 'PENDING',
      paymentStatus: finalAmount === 0 ? 'PAID' : 'PENDING',
      amountPaid: finalAmount,
      currency: ticketType.currency || 'USD',
      promoCodeId: promoCodeRecord?.id || null,
      discountAmount,
    },
  });

  // If free ticket, skip Stripe
  if (finalAmount === 0) {
    await confirmFreeRegistration(registration.id);
    return { registration, isFree: true };
  }

  // Create Stripe PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create(
    {
      amount: amountInCents,
      currency: ticketType.currency?.toLowerCase() || 'usd',
      metadata: {
        registrationId: registration.id,
        userId,
        eventId,
        ticketTypeId,
      },
      automatic_payment_methods: { enabled: true },
    },
    { idempotencyKey: `pi-${registration.id}` },
  );

  // Create pending payment record
  await prisma.payment.create({
    data: {
      registrationId: registration.id,
      stripePaymentIntentId: paymentIntent.id,
      amount: finalAmount,
      currency: ticketType.currency || 'USD',
      status: 'PENDING',
    },
  });

  return {
    registration,
    clientSecret: paymentIntent.client_secret,
    publishableKey: config.stripe.publishableKey,
    isFree: false,
  };
};

/**
 * Handle Stripe webhook events
 */
const handleWebhook = async (rawBody, signature) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, config.stripe.webhookSecret);
  } catch (err) {
    throw Object.assign(new Error(`Webhook verification failed: ${err.message}`), { statusCode: 400 });
  }

  // Process asynchronously to return 200 immediately
  setImmediate(() => processWebhookEvent(event));
};

const processWebhookEvent = async (event) => {
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      case 'charge.refunded':
        await handleRefund(event.data.object);
        break;
      default:
        logger.debug(`Unhandled webhook event: ${event.type}`);
    }
  } catch (err) {
    logger.error(`Webhook processing error for ${event.type}:`, err);
  }
};

const handlePaymentSuccess = async (paymentIntent) => {
  const { registrationId } = paymentIntent.metadata;
  if (!registrationId) return;

  const registration = await prisma.$transaction(async (tx) => {
    // Update payment
    await tx.payment.updateMany({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: {
        status: 'SUCCEEDED',
        stripeChargeId: paymentIntent.latest_charge,
        paymentMethod: 'CARD',
      },
    });

    // Update registration
    const updated = await tx.registration.update({
      where: { id: registrationId },
      data: { status: 'CONFIRMED', paymentStatus: 'PAID' },
      include: {
        event: true,
        user: true,
        ticketType: true,
      },
    });

    // Decrement ticket availability
    await tx.ticketType.update({
      where: { id: updated.ticketTypeId },
      data: { quantitySold: { increment: 1 } },
    });

    // Increment promo code uses
    if (updated.promoCodeId) {
      await tx.promoCode.update({
        where: { id: updated.promoCodeId },
        data: { currentUses: { increment: 1 } },
      });
    }

    return updated;
  });

  // Generate QR code
  const qrUrl = await qrCodeService.generateRegistrationQR(registration);
  await prisma.registration.update({ where: { id: registrationId }, data: { qrCodeUrl: qrUrl } });

  // Send confirmation email
  await emailService.queueEmail('registrationConfirmed', registration.user.email, {
    userName: registration.user.fullName,
    eventName: registration.event.title,
    eventDate: registration.event.startDate,
    registrationNumber: registration.registrationNumber,
    qrCodeUrl: qrUrl,
  });

  // Notify user
  await notificationService.sendNotification(registration.userId, 'PAYMENT_SUCCESS', {
    title: 'Registration Confirmed!',
    message: `You are confirmed for ${registration.event.title}`,
    actionUrl: `/registrations/${registration.id}`,
    metadata: { eventId: registration.eventId, registrationId },
  });

  // Emit WebSocket event for real-time registration count
  const wsClient = require('./websocket.client');
  wsClient.emitEventRegistration(registration.eventId);

  logger.info(`Payment succeeded for registration: ${registrationId}`);
};

const handlePaymentFailed = async (paymentIntent) => {
  const { registrationId } = paymentIntent.metadata;
  if (!registrationId) return;

  await prisma.$transaction([
    prisma.payment.updateMany({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: { status: 'FAILED', failureReason: paymentIntent.last_payment_error?.message || 'Unknown' },
    }),
    prisma.registration.update({
      where: { id: registrationId },
      data: { paymentStatus: 'FAILED' },
    }),
  ]);

  logger.warn(`Payment failed for registration: ${registrationId}`);
};

const handleRefund = async (charge) => {
  const payment = await prisma.payment.findFirst({
    where: { stripeChargeId: charge.id },
    include: { registration: { include: { user: true, event: true } } },
  });
  if (!payment) return;

  const refundAmount = charge.amount_refunded / 100;

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: { status: 'REFUNDED', refundAmount, refundedAt: new Date() },
    });
    await tx.registration.update({
      where: { id: payment.registrationId },
      data: { status: 'REFUNDED', paymentStatus: 'REFUNDED' },
    });
  });

  if (payment.registration?.user?.email) {
    await emailService.queueEmail('refundConfirmed', payment.registration.user.email, {
      userName: payment.registration.user.fullName,
      eventName: payment.registration.event.title,
      refundAmount,
    });
  }
};

/**
 * Process refund for a registration
 */
const processRefund = async (registrationId, reason, requestedBy) => {
  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: { payments: true },
  });
  if (!registration) throw Object.assign(new Error('Registration not found.'), { statusCode: 404 });

  const payment = registration.payments.find((p) => p.status === 'SUCCEEDED');
  if (!payment) throw Object.assign(new Error('No successful payment to refund.'), { statusCode: 400 });

  const refund = await stripe.refunds.create({
    payment_intent: payment.stripePaymentIntentId,
    reason: 'requested_by_customer',
  }, { idempotencyKey: `refund-${payment.id}` });

  await prisma.refund.create({
    data: {
      paymentId: payment.id,
      registrationId,
      stripeRefundId: refund.id,
      amount: parseFloat(refund.amount) / 100,
      reason,
      status: 'PENDING',
    },
  });

  return refund;
};

// ── Helpers ───────────────────────────────────────────────────

const validatePromoCode = async (code, eventId, ticketPrice) => {
  const promo = await prisma.promoCode.findUnique({ where: { code } });
  if (!promo || !promo.isActive) throw Object.assign(new Error('Invalid promo code.'), { statusCode: 400 });
  if (promo.validUntil < new Date()) throw Object.assign(new Error('Promo code expired.'), { statusCode: 400 });
  if (promo.validFrom > new Date()) throw Object.assign(new Error('Promo code not yet active.'), { statusCode: 400 });
  if (promo.maxUses && promo.currentUses >= promo.maxUses) {
    throw Object.assign(new Error('Promo code usage limit reached.'), { statusCode: 400 });
  }
  if (promo.eventId && promo.eventId !== eventId) {
    throw Object.assign(new Error('Promo code is not valid for this event.'), { statusCode: 400 });
  }
  if (promo.minPurchaseAmount && parseFloat(ticketPrice) < parseFloat(promo.minPurchaseAmount)) {
    throw Object.assign(new Error(`Minimum purchase of ${promo.minPurchaseAmount} required.`), { statusCode: 400 });
  }
  return promo;
};

const calculateDiscount = (promo, ticketPrice) => {
  const price = parseFloat(ticketPrice);
  if (promo.discountType === 'PERCENTAGE') return (price * parseFloat(promo.discountValue)) / 100;
  return Math.min(parseFloat(promo.discountValue), price);
};

const confirmFreeRegistration = async (registrationId) => {
  const registration = await prisma.registration.update({
    where: { id: registrationId },
    data: { status: 'CONFIRMED' },
    include: { event: true, user: true },
  });

  await prisma.ticketType.update({
    where: { id: registration.ticketTypeId },
    data: { quantitySold: { increment: 1 } },
  });

  const qrUrl = await qrCodeService.generateRegistrationQR(registration);
  await prisma.registration.update({ where: { id: registrationId }, data: { qrCodeUrl: qrUrl } });

  await emailService.queueEmail('registrationConfirmed', registration.user.email, {
    userName: registration.user.fullName,
    eventName: registration.event.title,
    eventDate: registration.event.startDate,
    registrationNumber: registration.registrationNumber,
    qrCodeUrl: qrUrl,
  });
};

module.exports = {
  createPaymentIntent,
  handleWebhook,
  processRefund,
};
