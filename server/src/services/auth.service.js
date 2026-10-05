import bcrypt from 'bcrypt';
import prisma from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { generateToken } from '../utils/token.js';
import { ROLES } from '../constants/roles.js';

const sanitizeUser = (user) => {
  const { passwordHash, ...sanitized } = user;
  return sanitized;
};

export const register = async ({ email, phone, password, firstName, lastName }) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        ...(phone ? [{ phone }] : []),
      ],
    },
  });

  if (existingUser) {
    if (existingUser.email === email) {
      throw AppError.conflict('An account with this email already exists', 'EMAIL_ALREADY_EXISTS');
    }
    if (phone && existingUser.phone === phone) {
      throw AppError.conflict('An account with this phone number already exists', 'PHONE_ALREADY_EXISTS');
    }
  }

  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const userCount = await prisma.user.count();
  const role = userCount === 0 ? ROLES.SUPER_ADMIN : ROLES.CUSTOMER;

  const user = await prisma.user.create({
    data: {
      email,
      phone: phone || null,
      passwordHash,
      firstName,
      lastName: lastName || null,
      role,
    },
  });

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return { user: sanitizeUser(user), token };
};

export const login = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    throw AppError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw AppError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return { user: sanitizeUser(user), token };
};

export const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { addresses: { orderBy: { isDefault: 'desc' } } },
  });
  if (!user) throw AppError.unauthorized('User not found', 'USER_NOT_FOUND');
  return sanitizeUser(user);
};

export const updateProfile = async (userId, { firstName, lastName, phone }) => {
  if (phone) {
    const existingPhone = await prisma.user.findFirst({
      where: { phone, NOT: { id: userId } },
    });
    if (existingPhone) {
      throw AppError.conflict('Phone number is already associated with another account', 'PHONE_TAKEN');
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(firstName !== undefined && { firstName }),
      ...(lastName !== undefined && { lastName }),
      ...(phone !== undefined && { phone: phone || null }),
    },
  });

  return sanitizeUser(user);
};

export const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw AppError.notFound('User not found', 'USER_NOT_FOUND');

  const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isPasswordValid) {
    throw AppError.badRequest('Current password does not match', 'INVALID_CURRENT_PASSWORD');
  }

  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(newPassword, saltRounds);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  return { message: 'Password updated successfully' };
};
