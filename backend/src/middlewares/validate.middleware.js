import { AppError, ERROR_CODES } from '#utils/httpErrors.js';

/**
 * Factory: returns middleware that validates req.body / req.query / req.params
 * against a zod schema. On failure, throws 400 VALIDATION_ERROR.
 */
export function validate({ body, query, params }) {
  return function (req, res, next) {
    try {
      if (body) req.body = body.parse(req.body);
      if (query) req.query = query.parse(req.query);
      if (params) req.params = params.parse(req.params);
      next();
    } catch (err) {
      if (err.issues) {
        const details = err.issues.map((i) => ({
          field: i.path.join('.'),
          message: i.message,
        }));
        console.error('Validation Error Details:', details);
        import('fs').then(fs => fs.writeFileSync('zod-error.json', JSON.stringify({ body: req.body, details }, null, 2)));
        return next(AppError.validation('Invalid input', details));
      }
      next(err);
    }
  };
}
