import pino from 'pino';
import { isProd } from '#config';

// Basic structured logger. In dev we use readable formatting; in prod, ndjson.
export const logger = pino(
  isProd
    ? { level: process.env.LOG_LEVEL || 'info' }
    : {
        level: process.env.LOG_LEVEL || 'debug',
        transport: { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:standard' } },
      }
);

export function logger_for(name) {
  return logger.child({ module: name });
}
