import fs from 'fs';
import path from 'path';

const write = (relPath, content) => {
  const fullPath = path.resolve('src', relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Wrote', relPath);
};

// 1. validators/auth.validator.js
write('validators/auth.validator.js', `
import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address').trim().toLowerCase(),
    phone: z.string().regex(/^[6-9]\\d{9}$/, 'Must be a valid 10-digit Indian phone number').optional().or(z.literal('')),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    firstName: z.string().min(1, 'First name is required').trim(),
    lastName: z.string().trim().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address').trim().toLowerCase(),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).trim().optional(),
    lastName: z.string().trim().optional(),
    phone: z.string().regex(/^[6-9]\\d{9}$/, 'Must be a valid 10-digit Indian phone number').optional().or(z.literal('')),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6),
  }),
});
`);

// 2. validators/cart.validator.js
write('validators/cart.validator.js', `
import { z } from 'zod';

export const addToCartSchema = z.object({
  body: z.object({
    variantId: z.string().min(1, 'Product variant is required'),
    quantity: z.number().int().positive().default(1),
  }),
});

export const updateCartItemSchema = z.object({
  body: z.object({
    quantity: z.number().int().nonnegative(),
  }),
});

export const addressSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    phone: z.string().regex(/^[6-9]\\d{9}$/, 'Must be a valid 10-digit Indian phone number'),
    addressLine1: z.string().min(5),
    addressLine2: z.string().optional(),
    city: z.string().min(2).default('Chennai'),
    state: z.string().default('Tamil Nadu'),
    pincode: z.string().regex(/^[1-9][0-9]{5}$/, 'Must be a valid 6-digit PIN code'),
    landmark: z.string().optional(),
    label: z.string().optional(),
    isDefault: z.boolean().default(false),
  }),
});
`);

// 3. validators/product.validator.js
write('validators/product.validator.js', `
import { z } from 'zod';

export const queryProductsSchema = z.object({
  query: z.object({
    category: z.string().optional(),
    type: z.enum(['RAW', 'KITCHEN', 'READY_TO_COOK']).optional(),
    search: z.string().optional(),
    minPrice: z.string().regex(/^\\d+(\\.\\d{1,2})?$/).transform(Number).optional(),
    maxPrice: z.string().regex(/^\\d+(\\.\\d{1,2})?$/).transform(Number).optional(),
    isFeatured: z.enum(['true', 'false']).transform((v) => v === 'true').optional(),
    isPopular: z.enum(['true', 'false']).transform((v) => v === 'true').optional(),
    isFreshCatch: z.enum(['true', 'false']).transform((v) => v === 'true').optional(),
    sort: z.enum(['price_asc', 'price_desc', 'rating', 'newest', 'popular']).optional().default('popular'),
    page: z.string().regex(/^\\d+$/).transform(Number).optional().default('1'),
    limit: z.string().regex(/^\\d+$/).transform(Number).optional().default('20'),
  }),
});

export const createProductSchema = z.object({
  body: z.object({
    categoryId: z.string().min(1),
    name: z.string().min(2),
    localName: z.string().optional(),
    slug: z.string().optional(),
    description: z.string().optional(),
    shortDescription: z.string().optional(),
    type: z.enum(['RAW', 'KITCHEN', 'READY_TO_COOK']).default('RAW'),
    basePrice: z.number().positive(),
    grossWeight: z.string().optional(),
    netWeight: z.string().optional(),
    serves: z.string().optional(),
    harborSource: z.string().optional(),
    storageTemp: z.string().optional(),
    cookingTips: z.string().optional(),
    badge: z.string().optional(),
    isFreshCatch: z.boolean().default(false),
    isPopular: z.boolean().default(false),
    isFeatured: z.boolean().default(false),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    variants: z.array(z.object({
      sku: z.string().min(2),
      weightValue: z.number().positive().optional(),
      weightUnit: z.string().default('kg'),
      cutType: z.enum(['WHOLE', 'CLEANED', 'CURRY_CUT', 'FRY_CUT', 'FILLET', 'SLICE', 'OTHER']).optional(),
      cleaningOption: z.string().optional(),
      price: z.number().positive(),
      compareAtPrice: z.number().positive().optional(),
      initialStock: z.number().int().nonnegative().default(20),
    })).optional(),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    categoryId: z.string().optional(),
    name: z.string().min(2).optional(),
    localName: z.string().optional(),
    description: z.string().optional(),
    shortDescription: z.string().optional(),
    type: z.enum(['RAW', 'KITCHEN', 'READY_TO_COOK']).optional(),
    basePrice: z.number().positive().optional(),
    grossWeight: z.string().optional(),
    netWeight: z.string().optional(),
    serves: z.string().optional(),
    harborSource: z.string().optional(),
    storageTemp: z.string().optional(),
    cookingTips: z.string().optional(),
    badge: z.string().optional(),
    isFreshCatch: z.boolean().optional(),
    isPopular: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
  }),
});
`);

// 4. integrations/r2/r2Client.js
write('integrations/r2/r2Client.js', `
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../../config/env.js';

let s3ClientInstance = null;

export const getR2Client = () => {
  if (!s3ClientInstance) {
    if (!config.r2.accessKeyId || !config.r2.secretAccessKey) {
      return null;
    }
    const endpoint = config.r2.endpoint || (config.r2.accountId ? \`https://\${config.r2.accountId}.r2.cloudflarestorage.com\` : null);
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

export const getPresignedUploadUrl = async ({ folder = 'products', filename, mimeType }) => {
  const s3 = getR2Client();
  const ext = filename ? filename.split('.').pop() : 'webp';
  const r2Key = \`\${folder}/\${uuidv4()}.\${ext}\`;

  if (!s3) {
    return {
      presignedUrl: \`http://localhost:\${config.port}/api/v1/media/mock-upload\`,
      r2Key,
      publicUrl: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=800',
    };
  }

  const command = new PutObjectCommand({
    Bucket: config.r2.bucketName,
    Key: r2Key,
    ContentType: mimeType,
  });

  const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
  const publicUrl = \`\${config.r2.publicBaseUrl || ''}/\${r2Key}\`;

  return { presignedUrl, r2Key, publicUrl };
};

export const deleteR2Object = async (r2Key) => {
  const s3 = getR2Client();
  if (!s3) return true;
  const command = new DeleteObjectCommand({
    Bucket: config.r2.bucketName,
    Key: r2Key,
  });
  return s3.send(command);
};
`);

// 5. integrations/razorpay/razorpayClient.js
write('integrations/razorpay/razorpayClient.js', `
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { config } from '../../config/env.js';

let razorpayInstance = null;

export const getRazorpay = () => {
  if (!razorpayInstance) {
    if (!config.razorpay.keyId || !config.razorpay.keySecret) {
      return null;
    }
    razorpayInstance = new Razorpay({
      key_id: config.razorpay.keyId,
      key_secret: config.razorpay.keySecret,
    });
  }
  return razorpayInstance;
};

export const createRazorpayOrder = async ({ amount, receipt, notes = {} }) => {
  const razorpay = getRazorpay();
  if (!razorpay) {
    return {
      id: \`order_dev_\${Date.now()}\`,
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt,
      status: 'created',
    };
  }
  const amountInPaise = Math.round(amount * 100);
  return razorpay.orders.create({
    amount: amountInPaise,
    currency: 'INR',
    receipt,
    notes,
  });
};

export const verifyPaymentSignature = ({ orderId, paymentId, signature }) => {
  if (!config.razorpay.keySecret) {
    return true;
  }
  const generatedSignature = crypto
    .createHmac('sha256', config.razorpay.keySecret)
    .update(\`\${orderId}|\${paymentId}\`)
    .digest('hex');

  return generatedSignature === signature;
};

export const verifyWebhookSignature = (body, signature) => {
  if (!config.razorpay.webhookSecret) return false;
  const expectedSignature = crypto
    .createHmac('sha256', config.razorpay.webhookSecret)
    .update(typeof body === 'string' ? body : JSON.stringify(body))
    .digest('hex');

  return expectedSignature === signature;
};
`);

console.log('Part 1 complete!');
