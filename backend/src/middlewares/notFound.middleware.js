import { AppError, ERROR_CODES } from '#utils/httpErrors.js';

/**
 * 404 handler for routes that don't match anything.
 */
export function notFound(req, res, next) {
  next(AppError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}
