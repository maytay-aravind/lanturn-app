import { randomUUID } from 'node:crypto';
import { logger } from '#utils/logger.js';

// Attach a request id (reusing an inbound one if present) and a request-scoped child logger.
export function requestContext(req, res, next) {
  req.id = req.headers['x-request-id'] || randomUUID();
  req.log = logger.child({ requestId: req.id });
  res.setHeader('X-Request-Id', req.id);
  next();
}
