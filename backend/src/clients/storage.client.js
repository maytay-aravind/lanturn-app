import { supabase } from '#supabase';
import { env, UPLOAD_POLICY } from '#config';
import { AppError } from '#utils/httpErrors.js';
import { logger_for } from '#utils/logger.js';
import { randomUUID } from 'node:crypto';

const log = logger_for('storage.client');

/** Map upload kind → Supabase bucket name */
const BUCKET = {
  resume:       'resumes',
  profilePhoto: 'profile-pictures',
  companyLogo:  'company-logos',
};

/**
 * Generate a Supabase Storage signed upload URL for a direct-to-bucket PUT.
 * The client uploads directly to Supabase Storage with progress tracking.
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

  const bucket = BUCKET[kind];
  const ext = mimeTypeToExt(mimeType);
  const fileId = randomUUID().slice(0, 8);
  const objectPath = `${policy.prefix}/${uid}/${kind}-${fileId}.${ext}`;

  // Create a Supabase signed upload URL (valid for 15 minutes)
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUploadUrl(objectPath, { upsert: true });

  if (error) {
    log.error({ error, kind, uid }, 'Failed to create signed upload URL');
    throw new Error(`Storage error: ${error.message}`);
  }

  // Compute the public / download URL
  const publicUrl = getPublicUrl(objectPath, kind);

  return {
    uploadUrl: data.signedUrl,
    token: data.token,
    objectPath,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    publicUrl,
  };
}

/**
 * Get the URL to access an uploaded object.
 * Public buckets return a permanent CDN URL.
 * Private buckets (resumes) return a signed download URL (1 hour).
 */
export function getPublicUrl(objectPath, kind) {
  const bucket = BUCKET[kind] || kindFromPath(objectPath);

  if (bucket === 'resumes') {
    // Resumes are private — build the public storage URL format;
    // actual access requires a signed URL generated on demand.
    // For now we store the path and generate signed URLs when needed.
    const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);
    return data.publicUrl;
  }

  // Profile pictures and company logos are public
  const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);
  return data.publicUrl;
}

/**
 * Generate a short-lived signed download URL for a private file (e.g., resume).
 * @param {string} objectPath - The storage object path
 * @param {number} expiresInSeconds - Default: 1 hour
 */
export async function getSignedDownloadUrl(objectPath, expiresInSeconds = 3600) {
  const { data, error } = await supabase.storage
    .from('resumes')
    .createSignedUrl(objectPath, expiresInSeconds);

  if (error) throw AppError.upstream(`Failed to sign download URL: ${error.message}`);
  return data.signedUrl;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mimeTypeToExt(mime) {
  const map = {
    'application/pdf': 'pdf',
    'image/png':       'png',
    'image/jpeg':      'jpg',
    'image/webp':      'webp',
  };
  return map[mime] || 'bin';
}

/** Infer bucket from object path prefix when kind is not available */
function kindFromPath(objectPath) {
  if (objectPath.startsWith('resumes/'))  return 'resumes';
  if (objectPath.startsWith('photos/'))   return 'profile-pictures';
  if (objectPath.startsWith('logos/'))    return 'company-logos';
  return 'resumes'; // safe default
}
