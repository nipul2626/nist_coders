'use strict';
const sgMail = require('@sendgrid/mail');
const Bull = require('bull');
const config = require('../config');
const { logger } = require('../utils/logger');

if (config.sendgrid.apiKey) {
  sgMail.setApiKey(config.sendgrid.apiKey);
}

// Create email queue
const emailQueue = new Bull('email', { redis: config.redisUrl });

// Template mappings
const TEMPLATES = {
  welcome: config.sendgrid.templates.welcome,
  verifyEmail: config.sendgrid.templates.verifyEmail,
  resetPassword: config.sendgrid.templates.resetPassword,
  registrationConfirmed: config.sendgrid.templates.registrationConfirmed,
  eventReminder: config.sendgrid.templates.eventReminder,
  teamInvite: config.sendgrid.templates.teamInvite,
  paymentReceipt: config.sendgrid.templates.paymentReceipt,
  refundConfirmed: config.sendgrid.templates.refundConfirmed,
  certificateReady: config.sendgrid.templates.certificateReady,
  eventUpdate: config.sendgrid.templates.eventUpdate,
  waitlistAvailable: config.sendgrid.templates.waitlistAvailable,
};

/**
 * Queue an email for async sending
 * @param {string} type - Template type key
 * @param {string} to - Recipient email
 * @param {object} data - Dynamic template data
 * @param {object} options - Queue priority options
 */
const queueEmail = async (type, to, data, options = {}) => {
  const priority = options.priority || 'normal'; // 'high' for transactional
  await emailQueue.add({ type, to, data }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    priority: priority === 'high' ? 1 : 10,
    removeOnComplete: true,
    removeOnFail: false,
  });
};

/**
 * Process email jobs from queue
 */
emailQueue.process(async (job) => {
  const { type, to, data } = job.data;
  await sendEmail(type, to, data);
});

emailQueue.on('failed', (job, err) => {
  logger.error(`Email job failed (type: ${job.data.type}, to: ${job.data.to}):`, err);
});

/**
 * Send email directly via SendGrid
 */
const sendEmail = async (type, to, data) => {
  if (!config.sendgrid.apiKey) {
    logger.warn(`Email service not configured. Would send "${type}" to ${to}`);
    return;
  }

  const templateId = TEMPLATES[type];
  if (!templateId) {
    logger.warn(`No SendGrid template configured for type: ${type}`);
    return;
  }

  const msg = {
    to,
    from: { email: config.sendgrid.fromEmail, name: config.sendgrid.fromName },
    templateId,
    dynamicTemplateData: {
      appName: config.appName,
      appUrl: config.frontendUrl,
      year: new Date().getFullYear(),
      ...data,
    },
  };

  try {
    await sgMail.send(msg);
    logger.info(`Email sent: ${type} → ${to}`);
  } catch (err) {
    logger.error(`SendGrid error (${type} → ${to}):`, err.response?.body || err.message);
    throw err;
  }
};

/**
 * Send bulk emails (lower priority queue)
 */
const queueBulkEmail = async (recipients, type, dataFn) => {
  for (const recipient of recipients) {
    await queueEmail(type, recipient.email, dataFn(recipient), { priority: 'low' });
  }
};

module.exports = { queueEmail, sendEmail, queueBulkEmail, emailQueue };
