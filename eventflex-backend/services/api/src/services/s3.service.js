'use strict';
const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const config = require('../config');
const { logger } = require('../utils/logger');

const s3 = new S3Client({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
});

const isConfigured = () => !!(config.aws.accessKeyId && config.aws.s3BucketName);

/**
 * Upload a file buffer to S3
 * @param {Buffer} buffer - File content
 * @param {string} folder - S3 folder (avatars, banners, certificates)
 * @param {string} mimeType - MIME type of the file
 * @returns {string} Public URL
 */
const uploadFile = async (buffer, folder, mimeType, originalName = '') => {
  if (!isConfigured()) {
    logger.warn('S3 not configured. Skipping upload.');
    return null;
  }

  const ext = originalName ? path.extname(originalName) : mimeTypeToExt(mimeType);
  const key = `${folder}/${uuidv4()}${ext}`;

  await s3.send(new PutObjectCommand({
    Bucket: config.aws.s3BucketName,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
    ACL: 'public-read',
  }));

  const baseUrl = config.aws.cloudfrontUrl || config.aws.s3Url;
  return `${baseUrl}/${key}`;
};

/**
 * Delete a file from S3 by its full URL or key
 */
const deleteFile = async (urlOrKey) => {
  if (!isConfigured()) return;
  try {
    const key = urlOrKey.includes('amazonaws.com') || urlOrKey.includes('cloudfront.net')
      ? new URL(urlOrKey).pathname.slice(1)
      : urlOrKey;

    await s3.send(new DeleteObjectCommand({ Bucket: config.aws.s3BucketName, Key: key }));
  } catch (err) {
    logger.warn('S3 delete error (non-fatal):', err.message);
  }
};

/**
 * Generate a pre-signed URL for private file access (certificates, etc.)
 */
const getPresignedUrl = async (key, expiresInSeconds = 3600) => {
  if (!isConfigured()) return null;
  const command = new GetObjectCommand({ Bucket: config.aws.s3BucketName, Key: key });
  return getSignedUrl(s3, command, { expiresIn: expiresInSeconds });
};

const mimeTypeToExt = (mimeType) => {
  const map = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'application/pdf': '.pdf',
  };
  return map[mimeType] || '';
};

module.exports = { uploadFile, deleteFile, getPresignedUrl };
