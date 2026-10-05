import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadBucketCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { config } from '../../config/env.js';

import dotenv from 'dotenv';

let s3ClientInstance = null;

export const getR2Client = () => {
  if (!s3ClientInstance) {
    if (!config.r2.accessKeyId || !config.r2.secretAccessKey) {
      return null;
    }
    const endpoint = config.r2.endpoint || (config.r2.accountId ? `https://${config.r2.accountId}.r2.cloudflarestorage.com` : null);
    if (!endpoint) return null;

    s3ClientInstance = new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId: config.r2.accessKeyId,
        secretAccessKey: config.r2.secretAccessKey,
      },
    });
  }
  return s3ClientInstance;
};

export const checkR2Status = async (forceRefresh = false) => {
  if (forceRefresh) {
    dotenv.config({ override: true });
    s3ClientInstance = null;
  }

  const isConfigured = Boolean(
    config.r2.accessKeyId &&
    config.r2.secretAccessKey &&
    (config.r2.endpoint || config.r2.accountId)
  );

  const bucketName = config.r2.bucketName || 'vsquare-seafood';
  const publicBaseUrl = config.r2.publicBaseUrl || null;

  if (!isConfigured) {
    return {
      configured: false,
      connected: false,
      storage: 'LOCAL_DISK',
      message: 'Cloudflare R2 keys not set in server/.env. Using local storage (/uploads).',
      details: {
        hasAccountId: Boolean(config.r2.accountId),
        hasAccessKeyId: Boolean(config.r2.accessKeyId),
        hasSecretAccessKey: Boolean(config.r2.secretAccessKey),
        bucketName,
        publicBaseUrl,
      },
    };
  }

  const s3 = getR2Client();
  if (!s3) {
    return {
      configured: true,
      connected: false,
      storage: 'LOCAL_DISK',
      message: 'Failed to initialize S3Client with provided Cloudflare R2 credentials.',
      details: { bucketName, publicBaseUrl },
    };
  }

  try {
    await s3.send(new HeadBucketCommand({ Bucket: bucketName }));
    return {
      configured: true,
      connected: true,
      storage: 'CLOUDFLARE_R2',
      bucketName,
      publicBaseUrl,
      message: `Connected successfully to Cloudflare R2 bucket "${bucketName}".`,
      details: {
        accountId: config.r2.accountId ? `${config.r2.accountId.slice(0, 6)}...` : null,
        bucketName,
        publicBaseUrl,
      },
    };
  } catch (err) {
    return {
      configured: true,
      connected: false,
      storage: 'LOCAL_FALLBACK',
      message: `Cloudflare R2 verification failed: ${err.message}`,
      error: err.message,
      details: { bucketName, publicBaseUrl },
    };
  }
};

export const uploadFileToR2 = async ({ buffer, filename, mimeType, folder = 'products' }) => {
  const s3 = getR2Client();
  if (!s3) return null;

  const ext = filename ? filename.split('.').pop() : 'webp';
  const cleanFilename = filename
    ? path.basename(filename, path.extname(filename)).replace(/[^a-zA-Z0-9_-]/g, '_')
    : 'image';
  const r2Key = `${folder}/${Date.now()}-${uuidv4().slice(0, 8)}-${cleanFilename}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: config.r2.bucketName,
    Key: r2Key,
    Body: buffer,
    ContentType: mimeType,
  });

  await s3.send(command);

  const baseUrl = (config.r2.publicBaseUrl || '').replace(/\/$/, '');
  const publicUrl = baseUrl
    ? `${baseUrl}/${r2Key}`
    : `https://${config.r2.bucketName}.${config.r2.accountId}.r2.cloudflarestorage.com/${r2Key}`;

  return { r2Key, publicUrl };
};

export const getPresignedUploadUrl = async ({ folder = 'products', filename, mimeType }) => {
  const s3 = getR2Client();
  const ext = filename ? filename.split('.').pop() : 'webp';
  const r2Key = `${folder}/${uuidv4()}.${ext}`;

  if (!s3) {
    return {
      presignedUrl: `http://localhost:${config.port}/api/v1/media/upload`,
      r2Key,
      publicUrl: `/uploads/${r2Key.split('/').pop()}`,
    };
  }

  const command = new PutObjectCommand({
    Bucket: config.r2.bucketName,
    Key: r2Key,
    ContentType: mimeType,
  });

  const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
  const baseUrl = (config.r2.publicBaseUrl || '').replace(/\/$/, '');
  const publicUrl = baseUrl
    ? `${baseUrl}/${r2Key}`
    : `https://${config.r2.bucketName}.${config.r2.accountId}.r2.cloudflarestorage.com/${r2Key}`;

  return { presignedUrl, r2Key, publicUrl };
};

export const deleteR2Object = async (r2Key) => {
  const s3 = getR2Client();
  if (!s3 || !r2Key) return true;
  try {
    const command = new DeleteObjectCommand({
      Bucket: config.r2.bucketName,
      Key: r2Key,
    });
    return await s3.send(command);
  } catch (err) {
    console.warn(`Could not delete R2 object ${r2Key}:`, err.message);
    return false;
  }
};
