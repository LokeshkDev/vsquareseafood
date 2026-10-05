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
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit Indian phone number'),
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
