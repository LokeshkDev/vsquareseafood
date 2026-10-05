import rateLimit from 'express-rate-limit';

const createLimiter = (max, windowMs, message) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next) => {
      res.status(429).json({
        success: false,
        message,
        code: 'TOO_MANY_REQUESTS'
      });
    }
  });
};

export const generalLimiter = createLimiter(
  100,
  15 * 60 * 1000,
  'Too many requests from this IP, please try again after 15 minutes'
);

export const authLimiter = createLimiter(
  10,
  15 * 60 * 1000,
  'Too many auth attempts from this IP, please try again after 15 minutes'
);

export const strictLimiter = createLimiter(
  5,
  15 * 60 * 1000,
  'Too many requests from this IP, please try again after 15 minutes'
);
