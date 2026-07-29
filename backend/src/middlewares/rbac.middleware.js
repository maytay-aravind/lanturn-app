import { AppError, ERROR_CODES } from '#utils/httpErrors.js';

/**
 * Require the authenticated user to have one of the given roles.
 */
export function requireRole(...roles) {
  return function (req, res, next) {
    if (!req.user) return next(AppError.unauthenticated());
    if (!roles.includes(req.user.role)) {
      return next(AppError.forbidden(`Requires role: ${roles.join(' or ')}`));
    }
    next();
  };
}

/**
 * Require profile completion (onboarding done).
 */
export function requireProfileComplete(req, res, next) {
  if (!req.user) return next(AppError.unauthenticated());
  if (!req.user.profileComplete) {
    return next(AppError.forbidden('Profile not complete. Please complete onboarding.'));
  }
  next();
}
