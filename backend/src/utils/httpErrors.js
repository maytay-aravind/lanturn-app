export const ERROR_CODES = Object.freeze({
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  UNPROCESSABLE: 'UNPROCESSABLE',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL: 'INTERNAL',
  UPSTREAM_ERROR: 'UPSTREAM_ERROR',
});

const STATUS_BY_CODE = {
  VALIDATION_ERROR: 400,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  RATE_LIMITED: 429,
  UPSTREAM_ERROR: 502,
  INTERNAL: 500,
};

export class AppError extends Error {
  constructor(code, message, { details, cause } = {}) {
    super(message, { cause });
    this.name = 'AppError';
    this.code = code;
    this.status = STATUS_BY_CODE[code] ?? 500;
    this.details = details;
  }

  static validation(message, details) {
    return new AppError(ERROR_CODES.VALIDATION_ERROR, message, { details });
  }
  static unauthenticated(message = 'Authentication required') {
    return new AppError(ERROR_CODES.UNAUTHENTICATED, message);
  }
  static forbidden(message = 'You do not have permission to do that') {
    return new AppError(ERROR_CODES.FORBIDDEN, message);
  }
  static notFound(message = 'Not found') {
    return new AppError(ERROR_CODES.NOT_FOUND, message);
  }
  static conflict(message) {
    return new AppError(ERROR_CODES.CONFLICT, message);
  }
  static unprocessable(message, details) {
    return new AppError(ERROR_CODES.UNPROCESSABLE, message, { details });
  }
  static rateLimited(message = 'Rate limit exceeded') {
    return new AppError(ERROR_CODES.RATE_LIMITED, message);
  }
  static upstream(message = 'Upstream service error') {
    return new AppError(ERROR_CODES.UPSTREAM_ERROR, message);
  }
}
