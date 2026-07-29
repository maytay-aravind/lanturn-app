import { createApp } from './app.js';
import { env } from '#config';
import { logger } from '#utils/logger.js';

// Initialize the Firebase Admin SDK by importing it (side effect).
import '#firebase';

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 LanTURN API listening on http://localhost:${env.PORT}/api`);
  logger.info(`   Health: http://localhost:${env.PORT}/api/health`);
});

function shutdown(signal) {
  logger.info({ signal }, 'Shutting down gracefully...');
  server.close(() => {
    logger.info('Process exiting');
    process.exit(0);
  });
  // Force exit after 10s if connections hang
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default server;
