import rateLimit from 'express-rate-limit';
import { AppError, ERROR_CODES } from '#utils/httpErrors.js';

// General API rate limiter
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      error: { code: ERROR_CODES.RATE_LIMITED, message: 'Too many requests. Try again later.' },
    });
  },
});

// Auth endpoints — stricter
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      error: { code: ERROR_CODES.RATE_LIMITED, message: 'Too many auth attempts. Try again later.' },
    });
  },
});

// AI endpoints — per-IP burst limiter (per-user quota is in the service layer)
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      error: { code: ERROR_CODES.RATE_LIMITED, message: 'AI rate limit exceeded.' },
    });
  },
});
