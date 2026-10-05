import { verifyToken } from '../utils/token.js';
import prisma from '../config/db.js';

export const authenticate = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Please log in to get access.',
        code: 'NO_TOKEN',
      });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (tokenErr) {
      res.clearCookie('token', { path: '/' });
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication token',
        code: 'INVALID_TOKEN',
      });
    }

    const userId = decoded?.id || decoded?.userId;
    if (!userId || typeof userId !== 'string') {
      res.clearCookie('token', { path: '/' });
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload',
        code: 'INVALID_TOKEN',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.clearCookie('token', { path: '/' });
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
        code: 'USER_NOT_FOUND',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
        code: 'ACCOUNT_DEACTIVATED',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
