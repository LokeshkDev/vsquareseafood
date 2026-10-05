import sharp from 'sharp';
import prisma from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { successResponse, createdResponse } from '../utils/response.js';
import {
  getR2Client,
  checkR2Status,
  uploadFileToR2,
  getPresignedUploadUrl,
  deleteR2Object,
} from '../integrations/r2/r2Client.js';
import { config } from '../config/env.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../../public/uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];

// Format bytes into human-readable string (MB/KB)
const formatBytes = (bytes, decimals = 2) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Image Optimization Pipeline (Converts MB images to lightweight WebP KB format)
export const optimizeImage = async (buffer, folder = 'catalog', originalName = 'image') => {
  const originalSize = buffer.length;

  // Determine max width based on image target folder
  let maxWidth = 1200;
  if (['banners', 'hero', 'delivery'].includes(folder.toLowerCase())) {
    maxWidth = 1920;
  } else if (['thumbnails', 'avatars', 'icons'].includes(folder.toLowerCase())) {
    maxWidth = 600;
  }

  // Convert to WebP format, resize to max dimensions, apply compression effort
  const sharpInstance = sharp(buffer);
  const metadata = await sharpInstance.metadata();

  const optimizedBuffer = await sharpInstance
    .resize({
      width: maxWidth,
      withoutEnlargement: true,
      fit: 'inside',
    })
    .webp({
      quality: 80, // High visual clarity with up to 85% compression ratio
      effort: 6,   // Maximum compression effort
      lossless: false,
    })
    .toBuffer();

  const optimizedMetadata = await sharp(optimizedBuffer).metadata();
  const compressedSize = optimizedBuffer.length;
  const savingsPercent = originalSize > 0
    ? Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100))
    : 0;

  const ext = path.extname(originalName);
  const baseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
  const webpFilename = `${Date.now()}-${baseName}.webp`;

  return {
    buffer: optimizedBuffer,
    filename: webpFilename,
    mimeType: 'image/webp',
    originalSize,
    compressedSize,
    savingsPercent,
    width: optimizedMetadata.width || metadata.width,
    height: optimizedMetadata.height || metadata.height,
  };
};

// Memory storage to process image buffers in memory before saving
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max upload allowed
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid image type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`));
    }
  },
});

export const getR2Status = async (req, res, next) => {
  try {
    const status = await checkR2Status(req.query.refresh === 'true');
    return successResponse(res, status);
  } catch (error) {
    next(error);
  }
};

export const directUpload = async (req, res, next) => {
  try {
    if (!req.file) {
      throw AppError.badRequest('No image file provided', 'NO_FILE');
    }

    const folder = req.body?.folder || 'catalog';

    // ⚡ Step 1: Optimize & Compress Image (MB -> KB WebP format)
    const optimized = await optimizeImage(req.file.buffer, folder, req.file.originalname);
    const formattedOriginalSize = formatBytes(optimized.originalSize);
    const formattedCompressedSize = formatBytes(optimized.compressedSize);
    const optimizationNote = `Compressed from ${formattedOriginalSize} to ${formattedCompressedSize} (${optimized.savingsPercent}% smaller)`;

    const s3 = getR2Client();

    // ⚡ Step 2: Upload Optimized WebP to Cloudflare R2 if configured
    if (s3) {
      try {
        const r2Result = await uploadFileToR2({
          buffer: optimized.buffer,
          filename: optimized.filename,
          mimeType: optimized.mimeType,
          folder,
        });

        if (r2Result && r2Result.publicUrl) {
          return successResponse(res, {
            url: r2Result.publicUrl,
            r2Key: r2Result.r2Key,
            storage: 'CLOUDFLARE_R2',
            filename: optimized.filename,
            originalSize: optimized.originalSize,
            compressedSize: optimized.compressedSize,
            size: optimized.compressedSize,
            savingsPercent: optimized.savingsPercent,
            mimetype: optimized.mimeType,
            width: optimized.width,
            height: optimized.height,
            optimizationNote,
          });
        }
      } catch (r2Error) {
        console.warn('Cloudflare R2 upload error, falling back to local storage:', r2Error.message);
      }
    }

    // ⚡ Step 3: Fallback - Save Optimized WebP to Local Disk
    const filePath = path.join(uploadDir, optimized.filename);
    fs.writeFileSync(filePath, optimized.buffer);
    const publicUrl = `/uploads/${optimized.filename}`;

    return successResponse(res, {
      url: publicUrl,
      storage: 'LOCAL_DISK',
      filename: optimized.filename,
      originalSize: optimized.originalSize,
      compressedSize: optimized.compressedSize,
      size: optimized.compressedSize,
      savingsPercent: optimized.savingsPercent,
      mimetype: optimized.mimeType,
      width: optimized.width,
      height: optimized.height,
      optimizationNote,
    });
  } catch (error) {
    next(error);
  }
};

export const directUploadMultiple = async (req, res, next) => {
  try {
    const files = req.files || (req.file ? [req.file] : []);
    if (!files || files.length === 0) {
      throw AppError.badRequest('No image files provided', 'NO_FILES');
    }

    const folder = req.body?.folder || 'catalog';
    const s3 = getR2Client();
    const uploadedImages = [];

    for (const file of files) {
      const optimized = await optimizeImage(file.buffer, folder, file.originalname);
      const formattedOriginalSize = formatBytes(optimized.originalSize);
      const formattedCompressedSize = formatBytes(optimized.compressedSize);
      const optimizationNote = `Compressed from ${formattedOriginalSize} to ${formattedCompressedSize} (${optimized.savingsPercent}% smaller)`;

      let finalUrl = `/uploads/${optimized.filename}`;
      let finalStorage = 'LOCAL_DISK';
      let r2Key = null;

      if (s3) {
        try {
          const r2Result = await uploadFileToR2({
            buffer: optimized.buffer,
            filename: optimized.filename,
            mimeType: optimized.mimeType,
            folder,
          });
          if (r2Result && r2Result.publicUrl) {
            finalUrl = r2Result.publicUrl;
            r2Key = r2Result.r2Key;
            finalStorage = 'CLOUDFLARE_R2';
          }
        } catch (r2Error) {
          console.warn('Cloudflare R2 upload error, falling back to local storage:', r2Error.message);
        }
      }

      if (finalStorage === 'LOCAL_DISK') {
        const filePath = path.join(uploadDir, optimized.filename);
        fs.writeFileSync(filePath, optimized.buffer);
      }

      uploadedImages.push({
        url: finalUrl,
        r2Key,
        storage: finalStorage,
        filename: optimized.filename,
        originalSize: optimized.originalSize,
        compressedSize: optimized.compressedSize,
        size: optimized.compressedSize,
        savingsPercent: optimized.savingsPercent,
        mimetype: optimized.mimeType,
        width: optimized.width,
        height: optimized.height,
        optimizationNote,
      });
    }

    return successResponse(res, uploadedImages);
  } catch (error) {
    next(error);
  }
};

export const getPresignedUrl = async (req, res, next) => {
  try {
    const { folder, filename, mimeType } = req.body;
    if (!mimeType || !ALLOWED_MIME_TYPES.includes(mimeType)) {
      throw AppError.badRequest(`Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`, 'INVALID_MIME_TYPE');
    }
    const result = await getPresignedUploadUrl({ folder: folder || 'products', filename, mimeType });
    return successResponse(res, result);
  } catch (error) {
    next(error);
  }
};

export const confirmUpload = async (req, res, next) => {
  try {
    const { productId, r2Key, publicUrl, altText, isPrimary, mimeType, fileSize } = req.body;
    if (!productId || !r2Key || !publicUrl) throw AppError.badRequest('Missing fields', 'MISSING_FIELDS');

    if (isPrimary) {
      await prisma.productImage.updateMany({ where: { productId }, data: { isPrimary: false } });
    }

    const image = await prisma.productImage.create({
      data: { productId, r2Key, publicUrl, altText: altText || null, isPrimary: !!isPrimary, mimeType: mimeType || null, fileSize: fileSize || null },
    });
    return createdResponse(res, image);
  } catch (error) {
    next(error);
  }
};

export const deleteMedia = async (req, res, next) => {
  try {
    const image = await prisma.productImage.findUnique({ where: { id: req.params.id } });
    if (!image) throw AppError.notFound('Image record not found', 'IMAGE_NOT_FOUND');
    await deleteR2Object(image.r2Key);
    await prisma.productImage.delete({ where: { id: req.params.id } });
    return successResponse(res, { message: 'Image deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteUploadedFile = async (req, res, next) => {
  try {
    const { url, r2Key } = req.body;
    if (!url && !r2Key) {
      throw AppError.badRequest('Please provide url or r2Key of image to delete', 'MISSING_PARAM');
    }

    let deletedFromR2 = false;
    let deletedFromLocal = false;

    // Check if R2 key or R2 url
    if (r2Key) {
      deletedFromR2 = await deleteR2Object(r2Key);
    } else if (url && (url.includes('.r2.cloudflarestorage.com') || url.includes('.r2.dev') || (config.r2.publicBaseUrl && url.startsWith(config.r2.publicBaseUrl)))) {
      try {
        const parsed = new URL(url);
        const key = parsed.pathname.replace(/^\//, '');
        deletedFromR2 = await deleteR2Object(key);
      } catch (e) {}
    }

    // Check if local file (/uploads/...)
    if (url && url.startsWith('/uploads/')) {
      const filename = path.basename(url);
      const filePath = path.join(uploadDir, filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          deletedFromLocal = true;
        } catch (e) {
          console.warn('Local file unlink error:', e.message);
        }
      }
    }

    return successResponse(res, {
      message: 'Image removed successfully',
      deletedFromR2,
      deletedFromLocal,
    });
  } catch (error) {
    next(error);
  }
};
