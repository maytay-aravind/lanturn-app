import { AppError, ERROR_CODES } from '#utils/httpErrors.js';
import { isProd } from '#config';

/**
 * Central error handler — must be registered AFTER all routes.
 */
export function errorHandler(err, req, res, _next) {
  // Zod validation errors that somehow escaped validate middleware
  if (err.issues) {
    const details = err.issues.map((i) => ({
      field: i.path.join('.'),
      message: i.message,
    }));
    return res.status(400).json({
      error: { code: ERROR_CODES.VALIDATION_ERROR, message: 'Invalid input', details },
      meta: { requestId: req.id },
    });
  }

  const appErr = err instanceof AppError ? err : new AppError(ERROR_CODES.INTERNAL, 'Internal server error');
  const status = appErr.status;

  const body = {
    error: { code: appErr.code, message: appErr.message },
    meta: { requestId: req.id },
  };

  if (appErr.details) body.error.details = appErr.details;

  // In dev, attach the original message for easier debugging.
  if (!isProd && err.stack) {
    body.error.stack = err.stack;
  }

  // Log 5xx errors with stack
  if (status >= 500 && req.log) {
    req.log.error({ err, code: appErr.code }, err.message);
  }

  res.status(status).json(body);
}
