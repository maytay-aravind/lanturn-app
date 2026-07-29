// Wrap an async route handler so rejections are forwarded to Express's error middleware.
export function asyncHandler(fn) {
  return function handler(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
