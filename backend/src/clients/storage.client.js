import { bucket } from '#firebase';
import { env, UPLOAD_POLICY } from '#config';
import { logger_for } from '#utils/logger.js';
import { randomUUID } from 'node:crypto';

const log = logger_for('storage.client');

/**
 * Generate a signed upload URL for a direct-to-bucket PUT.
 */
export async function signUploadUrl({ uid, kind, mimeType, sizeBytes }) {
  const policy = UPLOAD_POLICY[kind];
  if (!policy) throw new Error(`Unknown upload kind: ${kind}`);

  // Validate MIME type
  if (!policy.mimeTypes.includes(mimeType)) {
    throw new Error(`MIME type ${mimeType} not allowed for ${kind}`);
  }

  // Validate size
  if (sizeBytes > policy.maxSizeBytes) {
    throw new Error(`File too large: ${sizeBytes} > ${policy.maxSizeBytes}`);
  }

  const ext = mimeTypeToExt(mimeType);
  const fileId = randomUUID().slice(0, 8);
  const objectPath = `${policy.prefix}/${uid}/${kind}-${fileId}.${ext}`;

  // For emulator, the signed URL approach doesn't work — return the emulator URL
  if (env.FIREBASE_USE_EMULATOR) {
    const emulatorHost = env.STORAGE_EMULATOR_HOST || 'localhost:9199';
    return {
      uploadUrl: `http://${emulatorHost}/v0/b/${bucket.name}/o/${encodeURIComponent(objectPath)}?upload_type=media`,
      objectPath,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      publicUrl: `http://${emulatorHost}/v0/b/${bucket.name}/o/${encodeURIComponent(objectPath)}?alt=media`,
    };
  }

  // Production: use Firebase Storage signed URLs
  const file = bucket.file(objectPath);
  const [signedUrl] = await file.getSignedUrl({
    method: 'PUT',
    expires: Date.now() + 15 * 60 * 1000,
    contentType: mimeType,
  });

  // Use Firebase URL format which is free and respects Firebase Security Rules
  const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(objectPath)}?alt=media`;

  return {
    uploadUrl: signedUrl,
    objectPath,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    publicUrl,
  };
}

/**
 * Generate a public download URL for an object path.
 */
export function getPublicUrl(objectPath) {
  if (env.FIREBASE_USE_EMULATOR) {
    const emulatorHost = env.STORAGE_EMULATOR_HOST || 'localhost:9199';
    return `http://${emulatorHost}/v0/b/${bucket.name}/o/${encodeURIComponent(objectPath)}?alt=media`;
  }
  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(objectPath)}?alt=media`;
}

function mimeTypeToExt(mime) {
  const map = { 'application/pdf': 'pdf', 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' };
  return map[mime] || 'bin';
}
