import { createClient } from '@supabase/supabase-js';
import { env } from '#config';
import { logger_for } from '#utils/logger.js';

const log = logger_for('supabase');

if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
  log.error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing');
  process.exit(1);
}

/**
 * Supabase admin client (service role — bypasses RLS).
 * Used exclusively on the backend. Never expose the service role key to the frontend.
 */
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

log.info({ url: env.SUPABASE_URL }, 'Supabase client initialized');
