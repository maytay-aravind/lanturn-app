import { studentsRepo } from '#repositories/students.repository.js';
import { employersRepo } from '#repositories/employers.repository.js';
import { usersRepo } from '#repositories/users.repository.js';
import { getSignedDownloadUrl } from '#clients/storage.client.js';
import { AppError } from '#utils/httpErrors.js';
import { ROLES } from '#config';
import { logger_for } from '#utils/logger.js';

const log = logger_for('profile.service');

/**
 * Determine whether a stored resume value is a raw object path (private bucket)
 * or a legacy full HTTP URL (old format, before this fix was applied).
 * Object paths look like: "resumes/uid/resume-abc123.pdf"
 * HTTP URLs look like:    "https://..."
 */
function isObjectPath(value) {
  return value && !value.startsWith('http');
}

/**
 * Normalise a legacy full Supabase public/signed URL back to its object path.
 * e.g. "https://project.supabase.co/storage/v1/object/public/resumes/resumes/uid/file.pdf"
 *   →   "resumes/uid/file.pdf"
 *
 * This is needed because the resumes bucket is PRIVATE — public URLs are
 * inaccessible and the service role key must generate signed URLs instead.
 */
function toObjectPath(rawResumeUrl) {
  if (!rawResumeUrl || !rawResumeUrl.startsWith('http')) return rawResumeUrl;

  try {
    const url = new URL(rawResumeUrl);
    // Supabase public URLs: /storage/v1/object/public/<bucket>/<objectPath...>
    const match = url.pathname.match(/^\/storage\/v1\/object\/(?:public|signed)\/[^/]+\/(.+)$/);
    if (match) {
      log.info({ rawResumeUrl, objectPath: match[1] }, 'Normalised legacy resume URL to object path');
      return match[1];
    }
  } catch {
    // Not a valid URL — return as-is
  }

  return rawResumeUrl;
}

/**
 * Given a raw student row, resolve the resumeUrl:
 * - If it's an objectPath → generate a 1-hour signed URL
 * - If it's a legacy http URL → normalise to object path, then sign it
 * - If empty → return ''
 */
async function resolveResumeUrl(rawResumeUrl) {
  if (!rawResumeUrl) return '';
  const objectPath = isObjectPath(rawResumeUrl) ? rawResumeUrl : toObjectPath(rawResumeUrl);
  if (!objectPath || objectPath.startsWith('http')) {
    // Could not extract object path — return as last resort
    return rawResumeUrl;
  }
  try {
    return await getSignedDownloadUrl(objectPath, 3600);
  } catch (err) {
    log.warn({ err, path: objectPath }, 'Failed to sign resume URL — returning empty');
    return '';
  }
}

/** Get or update the student's own profile */
export async function getStudentProfile(uid) {
  const profile = await studentsRepo.getById(uid);
  if (!profile) throw AppError.notFound('Student profile not found');

  // Resolve a fresh signed URL for the resume on every profile fetch
  const resumeUrl = await resolveResumeUrl(profile.resumeUrl);
  return { ...profile, resumeUrl };
}

export async function updateStudentProfile(uid, data) {
  // Ensure the student row exists before attempting an update —
  // users who skipped onboarding may not have a row yet.
  await studentsRepo.ensureAndUpdate(uid, {});

  // Rebuild searchableSkills if skills changed
  if (data.professional?.skills) {
    data.searchableSkills = data.professional.skills.map((s) => s.toLowerCase());
  }
  if (data.academic?.graduationYear) {
    data.graduationYear = data.academic.graduationYear;
  }

  const updated = await studentsRepo.update(uid, data);

  // Re-resolve resume URL for the returned profile
  const resumeUrl = await resolveResumeUrl(updated?.resumeUrl);
  return { ...updated, resumeUrl };
}

/**
 * Generate a fresh short-lived signed URL for the current student's resume.
 * Called by GET /students/me/resume-url so the "View" button always works.
 */
export async function getStudentResumeSignedUrl(uid) {
  const profile = await studentsRepo.getById(uid);
  if (!profile) throw AppError.notFound('Student profile not found');
  if (!profile.resumeUrl) throw AppError.notFound('No resume uploaded yet');

  const objectPath = isObjectPath(profile.resumeUrl) ? profile.resumeUrl : toObjectPath(profile.resumeUrl);
  if (!objectPath || objectPath.startsWith('http')) {
    // Could not extract object path — return raw URL as last resort
    return { signedUrl: profile.resumeUrl, expiresIn: null };
  }

  const signedUrl = await getSignedDownloadUrl(objectPath, 3600);
  return { signedUrl, expiresIn: 3600 };
}

/**
 * Generate a fresh short-lived signed URL for a specific certificate.
 * Called by GET /students/me/certificate-url?path=...
 */
export async function getStudentCertificateSignedUrl(uid, path) {
  const profile = await studentsRepo.getById(uid);
  if (!profile) throw AppError.notFound('Student profile not found');
  
  // Verify that this path actually belongs to one of their certificates
  const cert = profile.certificates?.find(c => c.url === path);
  if (!cert) throw AppError.notFound('Certificate not found on profile');

  const objectPath = isObjectPath(path) ? path : toObjectPath(path);
  if (!objectPath || objectPath.startsWith('http')) {
    return { signedUrl: path, expiresIn: null };
  }

  const signedUrl = await getSignedDownloadUrl(objectPath, 3600);
  return { signedUrl, expiresIn: 3600 };
}

export async function getStudentPublic(uid) {
  const profile = await studentsRepo.getById(uid);
  if (!profile) throw AppError.notFound('Student not found');
  // Return limited fields for public view — never expose resumeUrl/resumeText
  const { resumeUrl, resumeText, ...pub } = profile;
  return pub;
}

/** Employer profile */
export async function getEmployerProfile(uid) {
  const profile = await employersRepo.getById(uid);
  if (!profile) throw AppError.notFound('Employer profile not found');
  return profile;
}

export async function updateEmployerProfile(uid, data) {
  return employersRepo.update(uid, data);
}

export async function getEmployerPublic(uid) {
  const profile = await employersRepo.getById(uid);
  if (!profile) throw AppError.notFound('Employer not found');
  return profile;
}
