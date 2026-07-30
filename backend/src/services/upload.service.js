import { signUploadUrl, getPublicUrl } from '#clients/storage.client.js';
import { studentsRepo } from '#repositories/students.repository.js';
import { employersRepo } from '#repositories/employers.repository.js';
import { AppError } from '#utils/httpErrors.js';
import { ROLES, UPLOAD_POLICY, UPLOAD_KINDS } from '#config';
import { logger_for } from '#utils/logger.js';

const log = logger_for('upload.service');

/** Step 1: generate a signed URL for direct upload */
export async function signUpload(uid, { kind, mimeType, sizeBytes }) {
  const policy = UPLOAD_POLICY[kind];
  if (!policy) throw AppError.validation('Invalid upload kind');
  if (!policy.mimeTypes.includes(mimeType)) {
    throw AppError.validation('Unsupported file type', [{ field: 'mimeType', message: `${mimeType} not allowed` }]);
  }
  if (sizeBytes > policy.maxSizeBytes) {
    throw AppError.validation('File too large', [{
      field: 'sizeBytes',
      message: `Max ${policy.maxSizeBytes} bytes for ${kind}`,
    }]);
  }

  const result = await signUploadUrl({ uid, kind, mimeType, sizeBytes });
  return result;
}

/** Step 2: commit the upload — persist the URL onto the profile */
export async function commitUpload(uid, role, { kind, objectPath }) {
  // Always pass `kind` so the correct bucket is resolved — never rely on
  // path-prefix inference which breaks if prefixes drift.
  const publicUrl = getPublicUrl(objectPath, kind);

  if (kind === UPLOAD_KINDS.RESUME) {
    // Resumes live in a private Supabase bucket — public URLs return 403.
    // Store the raw objectPath instead; signed download URLs are generated
    // on demand in profile.service when the profile is fetched.
    await studentsRepo.ensureAndUpdate(uid, { resumeUrl: objectPath });
    return { objectPath, attachedTo: 'students.me.resumeUrl' };
  }

  if (kind === UPLOAD_KINDS.PROFILE_PHOTO) {
    if (role === ROLES.STUDENT) {
      await studentsRepo.ensureAndUpdate(uid, { profilePhotoURL: publicUrl });
    } else if (role === ROLES.EMPLOYER) {
      await employersRepo.update(uid, { logoURL: publicUrl });
    }
    return { url: publicUrl, attachedTo: 'profilePhotoURL' };
  }

  if (kind === UPLOAD_KINDS.COMPANY_LOGO) {
    await employersRepo.update(uid, { logoURL: publicUrl });
    return { url: publicUrl, attachedTo: 'employers.me.logoURL' };
  }

  throw AppError.validation('Unknown upload kind');
}
