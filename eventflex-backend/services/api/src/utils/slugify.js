'use strict';
const slugifyLib = require('slugify');
const { v4: uuidv4 } = require('uuid');

/**
 * Generate a URL-safe slug from a string
 * Appends a short unique suffix to ensure uniqueness
 */
const generateSlug = (text, addSuffix = false) => {
  const base = slugifyLib(text, {
    lower: true,
    strict: true,
    trim: true,
  });
  if (addSuffix) {
    const suffix = uuidv4().split('-')[0]; // 8-char suffix
    return `${base}-${suffix}`;
  }
  return base;
};

/**
 * Check if a slug is available in the database
 * If not, append suffix and check again (recursive, max 5 tries)
 */
const ensureUniqueSlug = async (text, prisma, tries = 0) => {
  const slug = tries === 0 ? generateSlug(text) : generateSlug(text, true);
  const existing = await prisma.event.findUnique({ where: { slug } });
  if (!existing) return slug;
  if (tries >= 5) return generateSlug(text, true); // Force suffix after 5 tries
  return ensureUniqueSlug(text, prisma, tries + 1);
};

/**
 * Generate a short alphanumeric team code (6 chars)
 */
const generateTeamCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

/**
 * Generate a registration number like EF-2024-000001
 */
const generateRegistrationNumber = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `EF-${year}-${random}`;
};

/**
 * Generate a certificate ID like CERT-XXXXXXXX
 */
const generateCertificateId = () => {
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `CERT-${random}`;
};

module.exports = {
  generateSlug,
  ensureUniqueSlug,
  generateTeamCode,
  generateRegistrationNumber,
  generateCertificateId,
};
