import { env } from '#config';
import { logger_for } from '#utils/logger.js';

const log = logger_for('email.client');

/**
 * Stub email client — logs what it would send.
 * Swap for Resend/Brevo/SendGrid when a real provider is configured.
 */
export const emailClient = {
  async send({ to, subject, html, text }) {
    if (!env.GEMINI_API_KEY && !to) return { ok: true }; // allow skip in pure dev
    log.info({ to, subject }, 'Email would be sent (stub)');
    // TODO: wire real provider here
    return { ok: true };
  },
};
