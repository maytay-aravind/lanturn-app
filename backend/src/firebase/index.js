import admin from 'firebase-admin';
import { env } from '#config';
import { logger_for } from '#utils/logger.js';

const log = logger_for('firebase-auth');

let _app = null;

function init() {
  if (_app) return _app;

  if (!env.FIREBASE_PROJECT_ID) {
    // Dev fallback: use emulator
    process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
    _app = admin.initializeApp({ projectId: 'lanturn-dev' });
    log.warn('Firebase Admin initialized against local Auth emulator');
  } else {
    // Production: service account credentials
    _app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        // Env stores literal \n — convert to real newlines
        privateKey: env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    log.info({ projectId: env.FIREBASE_PROJECT_ID }, 'Firebase Admin Auth initialized');
  }

  return _app;
}

init();

/**
 * Firebase Admin Auth instance.
 * Used ONLY for verifying Firebase ID tokens (Google Sign-In).
 * All database and storage operations go through Supabase.
 */
export const auth = admin.auth();
