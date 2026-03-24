'use strict';
const QRCode = require('qrcode');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const config = require('../config');
const { logger } = require('../utils/logger');

const s3 = new S3Client({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
});

/**
 * Generate QR code for a registration and upload to S3
 * @returns {string} Public URL of the QR code image
 */
const generateRegistrationQR = async (registration) => {
  try {
    const payload = JSON.stringify({
      registrationId: registration.id,
      registrationNumber: registration.registrationNumber,
      eventId: registration.eventId,
      userId: registration.userId,
      verifyUrl: `${config.appUrl}/api/v1/registrations/${registration.id}/verify`,
    });

    // Generate QR as PNG buffer
    const qrBuffer = await QRCode.toBuffer(payload, {
      type: 'png',
      width: 400,
      margin: 2,
      color: { dark: '#1a1625', light: '#ffffff' },
    });

    // Upload to S3 (or return data URL if S3 not configured)
    if (!config.aws.accessKeyId || !config.aws.s3BucketName) {
      const dataUrl = `data:image/png;base64,${qrBuffer.toString('base64')}`;
      logger.warn('S3 not configured - returning QR as data URL');
      return dataUrl;
    }

    const key = `qrcodes/${registration.id}.png`;
    await s3.send(new PutObjectCommand({
      Bucket: config.aws.s3BucketName,
      Key: key,
      Body: qrBuffer,
      ContentType: 'image/png',
      ACL: 'public-read',
    }));

    const baseUrl = config.aws.cloudfrontUrl || config.aws.s3Url;
    return `${baseUrl}/${key}`;
  } catch (err) {
    logger.error('QR code generation error:', err);
    throw err;
  }
};

/**
 * Verify a QR code payload
 */
const verifyQRCode = async (payload) => {
  try {
    const data = typeof payload === 'string' ? JSON.parse(payload) : payload;
    const prisma = require('../config/prisma');
    const registration = await prisma.registration.findUnique({
      where: { id: data.registrationId },
      include: { user: true, event: true },
    });
    return registration;
  } catch {
    return null;
  }
};

module.exports = { generateRegistrationQR, verifyQRCode };
