import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from '#config';
import { generalLimiter, requestContext, errorHandler, notFound } from '#middlewares';
import routes from './routes/index.js';
import { logger } from '#utils/logger.js';

export function createApp() {
  const app = express();

  // Trust proxy (needed when behind Render/Nginx for correct IPs / rate limiting)
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  // Security headers
  app.use(helmet());

  // CORS — allowlist from env
  app.use(
    cors({
      origin(origin, cb) {
        // Allow non-browser clients (no Origin) and allowlisted origins
        if (!origin || env.CORS_ORIGINS.includes(origin)) return cb(null, true);
        return cb(new Error(`Origin ${origin} not allowed by CORS`));
      },
      credentials: true,
    })
  );

  // Body parsing
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Request context (requestId + scoped logger)
  app.use(requestContext);

  // General rate limiter
  app.use(generalLimiter);

  // Health routes mounted at root (e.g. /api/health)
  app.use('/api', routes);

  // 404 + error handlers (last)
  app.use(notFound);
  app.use(errorHandler);

  logger.info({ origins: env.CORS_ORIGINS, port: env.PORT }, 'LanTURN API app configured');

  return app;
}
