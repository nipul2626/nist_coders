'use strict';
const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('./auth');
const userRoutes = require('./users');
const eventRoutes = require('./events');
const registrationRoutes = require('./registrations');
const teamRoutes = require('./teams');
const paymentRoutes = require('./payments');
const promoRoutes = require('./promoCodes');
const savedRoutes = require('./saved');
const waitlistRoutes = require('./waitlist');
const certificateRoutes = require('./certificates');
const searchRoutes = require('./search');
const analyticsRoutes = require('./analytics');
const adminRoutes = require('./admin');
const aiRoutes = require('./ai');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/events', eventRoutes);
router.use('/registrations', registrationRoutes);
router.use('/teams', teamRoutes);
router.use('/payments', paymentRoutes);
router.use('/promo-codes', promoRoutes);
router.use('/saved', savedRoutes);
router.use('/waitlist', waitlistRoutes);
router.use('/certificates', certificateRoutes);
router.use('/search', searchRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/admin', adminRoutes);
router.use('/ai', aiRoutes);

module.exports = router;
