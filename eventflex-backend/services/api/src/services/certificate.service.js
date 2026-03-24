'use strict';
const PDFDocument = require('pdfkit');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const prisma = require('../config/prisma');
const s3Service = require('./s3.service');
const emailService = require('./email.service');
const notificationService = require('./notification.service');
const { generateCertificateId } = require('../utils/slugify');
const { logger } = require('../utils/logger');
const config = require('../config');

/**
 * Generate a PDF certificate for a registration and upload to S3
 */
const generateCertificate = async (registrationId) => {
  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: {
      user: { select: { fullName: true, email: true } },
      event: { select: { id: true, title: true, startDate: true, endDate: true, category: true } },
    },
  });

  if (!registration) throw Object.assign(new Error('Registration not found.'), { statusCode: 404 });
  if (registration.status !== 'CONFIRMED' && registration.status !== 'CHECKED_IN') {
    throw Object.assign(new Error('Certificate can only be issued for confirmed attendees.'), { statusCode: 400 });
  }

  // Check if certificate already exists
  const existing = await prisma.certificate.findUnique({ where: { registrationId } });
  if (existing) return existing;

  const certId = generateCertificateId();
  const pdfBuffer = await buildCertificatePDF({
    userName: registration.user.fullName,
    eventName: registration.event.title,
    eventDate: registration.event.startDate,
    category: registration.event.category,
    certificateId: certId,
  });

  // Upload to S3
  let certificateUrl;
  const certKey = `certificates/${certId}.pdf`;

  try {
    certificateUrl = await s3Service.uploadFile(pdfBuffer, 'certificates', 'application/pdf', `${certId}.pdf`);
  } catch {
    // Fallback: serve from local (dev only)
    const localPath = path.join(process.cwd(), 'temp', `${certId}.pdf`);
    fs.mkdirSync(path.dirname(localPath), { recursive: true });
    fs.writeFileSync(localPath, pdfBuffer);
    certificateUrl = `${config.appUrl}/temp/${certId}.pdf`;
  }

  const certificate = await prisma.certificate.create({
    data: {
      registrationId,
      eventId: registration.event.id,
      userId: registration.userId,
      certificateUrl,
      certificateId: certId,
      issuedAt: new Date(),
    },
  });

  // Notify user
  await notificationService.sendNotification(registration.userId, 'CERTIFICATE_READY', {
    title: 'Your Certificate is Ready!',
    message: `Your certificate for ${registration.event.title} has been generated.`,
    actionUrl: `/certificates/${registrationId}`,
    metadata: { certificateId: certId },
  });

  await emailService.queueEmail('certificateReady', registration.user.email, {
    userName: registration.user.fullName,
    eventName: registration.event.title,
    certificateUrl,
    downloadUrl: certificateUrl,
  });

  logger.info(`Certificate generated: ${certId} for registration ${registrationId}`);
  return certificate;
};

/**
 * Build the PDF buffer for a certificate
 */
const buildCertificatePDF = (data) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 50 });
    const buffers = [];

    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;

    // Background
    doc.rect(0, 0, pageWidth, pageHeight).fill('#1a1625');

    // Border
    doc.rect(20, 20, pageWidth - 40, pageHeight - 40)
      .lineWidth(2).stroke('#7c3aed');

    // Title
    doc.fillColor('#ffffff')
      .font('Helvetica-Bold')
      .fontSize(36)
      .text('CERTIFICATE OF PARTICIPATION', 50, 80, { align: 'center', width: pageWidth - 100 });

    // Subtitle
    doc.fillColor('#a78bfa')
      .fontSize(14)
      .font('Helvetica')
      .text('This is to certify that', 50, 150, { align: 'center', width: pageWidth - 100 });

    // Name
    doc.fillColor('#ffffff')
      .font('Helvetica-Bold')
      .fontSize(48)
      .text(data.userName, 50, 185, { align: 'center', width: pageWidth - 100 });

    // Participation text
    doc.fillColor('#a78bfa')
      .font('Helvetica')
      .fontSize(14)
      .text('has successfully participated in', 50, 255, { align: 'center', width: pageWidth - 100 });

    // Event name
    doc.fillColor('#f59e0b')
      .font('Helvetica-Bold')
      .fontSize(28)
      .text(data.eventName, 50, 280, { align: 'center', width: pageWidth - 100 });

    // Date
    const formattedDate = new Date(data.eventDate).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
    doc.fillColor('#9ca3af')
      .font('Helvetica')
      .fontSize(12)
      .text(`Held on ${formattedDate}`, 50, 330, { align: 'center', width: pageWidth - 100 });

    // Certificate ID
    doc.fillColor('#6b7280')
      .fontSize(10)
      .text(`Certificate ID: ${data.certificateId}`, 50, pageHeight - 70, { align: 'center', width: pageWidth - 100 });

    doc.fillColor('#6b7280')
      .fontSize(10)
      .text('EventFlex — Event Management, Reimagined for Students', 50, pageHeight - 50, {
        align: 'center', width: pageWidth - 100,
      });

    doc.end();
  });
};

/**
 * Verify a certificate by its public ID
 */
const verifyCertificate = async (certificateId) => {
  const cert = await prisma.certificate.findUnique({
    where: { certificateId },
    include: {
      user: { select: { fullName: true } },
      event: { select: { title: true, startDate: true, category: true } },
    },
  });
  if (!cert) return null;
  return cert;
};

module.exports = { generateCertificate, verifyCertificate };
