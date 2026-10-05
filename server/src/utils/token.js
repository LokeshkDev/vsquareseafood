import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export const generateToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, config.jwt.secret);
};

export const getCookieOptions = () => {
  const expiresInStr = config.jwt.expiresIn.toString();
  const days = parseInt(expiresInStr, 10) || 7;
  const maxAge = days * 24 * 60 * 60 * 1000;

  return {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge
  };
};
