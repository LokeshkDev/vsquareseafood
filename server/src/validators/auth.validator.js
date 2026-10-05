import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address').trim().toLowerCase(),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit Indian phone number').optional().or(z.literal('')),
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
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit Indian phone number').optional().or(z.literal('')),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6),
  }),
});
