import admin from 'firebase-admin';
import { env } from '#config';

let app = null;

function init() {
  if (app) return app;

  // When using the emulator (no projectId), use a placeholder application.
  if (env.FIREBASE_USE_EMULATOR || !env.FIREBASE_PROJECT_ID) {
    // Point the Admin SDK at the local emulator.
    process.env.FIRESTORE_EMULATOR_HOST = env.FIRESTORE_EMULATOR_HOST;
    process.env.FIREBASE_AUTH_EMULATOR_HOST = env.FIREBASE_AUTH_EMULATOR_HOST;
    process.env.STORAGE_EMULATOR_HOST = env.STORAGE_EMULATOR_HOST;

    app = admin.initializeApp({
      projectId: env.FIREBASE_PROJECT_ID || 'lanturn-dev',
      storageBucket: env.FIREBASE_STORAGE_BUCKET || 'lanturn-dev.appspot.com',
    });
  } else {
    // Production: use a service account from env vars.
    app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        // The private key is stored with literal "\n" in env; convert to real newlines.
        privateKey: env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      storageBucket: env.FIREBASE_STORAGE_BUCKET,
    });
  }

  return app;
}

init();

export const firebaseApp = app;
export const auth = admin.auth();
export const db = admin.firestore();
export const bucket = admin.storage().bucket();

// Conventional Firestore field values.
export const FieldValue = admin.firestore.FieldValue;
