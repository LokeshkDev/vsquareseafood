import { AppError } from '../utils/AppError.js';

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(AppError.forbidden('You do not have permission to perform this action', 'INSUFFICIENT_PERMISSIONS'));
    }
    next();
  };
};
