import { z } from 'zod';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Minimal .env loader. We avoid a dotenv dependency: parse KEY=VALUE lines
 * from backend/.env into process.env (without overwriting real env vars).
 */
function loadDotEnv() {
  const envPath = resolve(process.cwd(), '.env');
  let raw;
  try {
    raw = readFileSync(envPath, 'utf8');
  } catch {
    return; // no .env file — fall back to process.env only
  }
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    // strip surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

loadDotEnv();

const boolString = z
  .string()
  .optional()
  .transform((v) => v === 'true' || v === '1');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(8080),

  CORS_ORIGINS: z
    .string()
    .default('http://localhost:5173')
    .transform((s) => s.split(',').map((o) => o.trim()).filter(Boolean)),

  // Firebase Auth (kept for Google Login token verification)
  FIREBASE_PROJECT_ID: z.string().optional().default(''),
  FIREBASE_CLIENT_EMAIL: z.string().optional().default(''),
  FIREBASE_PRIVATE_KEY: z.string().optional().default(''),

  // Supabase (database + storage)
  SUPABASE_URL: z.string().url().optional().default('https://placeholder.supabase.co'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default(''),

  // Gemini & Deepseek
  GEMINI_API_KEY: z.string().optional().default(''),
  DEEPSEEK_API_KEY: z.string().optional().default(''),

  // Jooble (external job search)
  JOOBLE_API_KEY: z.string().optional().default(''),

  // Limits
  UPLOAD_MAX_BYTES: z.coerce.number().int().positive().default(5242880),
  AI_RATE_LIMIT_PER_DAY: z.coerce.number().int().positive().default(20),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('❌ Invalid environment variables:\n', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === 'production';
export const isDev = env.NODE_ENV === 'development';
