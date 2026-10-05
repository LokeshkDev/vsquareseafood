import { config } from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  console.error('[API Error]', req.method, req.originalUrl, err);
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong';
  let code = err.code || (statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'ERROR');

  // Prisma known errors
  if (err.name === 'PrismaClientKnownRequestError') {
    if (err.code === 'P2002') {
      statusCode = 409;
      message = 'Duplicate field value entered';
      code = 'DUPLICATE_FIELD';
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Record not found';
      code = 'NOT_FOUND';
    }
  }

  // Zod validation errors
  if (err.name === 'ZodError') {
    statusCode = 400;
    message = err.errors?.map((e) => e.message).join(', ') || 'Validation error';
    code = 'VALIDATION_ERROR';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
    code = 'INVALID_TOKEN';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired';
    code = 'TOKEN_EXPIRED';
  }

  if (config.nodeEnv === 'development') {
    return res.status(statusCode).json({
      success: false,
      message,
      code,
      stack: err.stack,
    });
  }

  return res.status(statusCode).json({
    success: false,
    message,
    code,
  });
};
