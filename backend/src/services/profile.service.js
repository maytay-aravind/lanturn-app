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
 * Given a raw student row, resolve the resumeUrl:
 * - If it's an objectPath → generate a 1-hour signed URL
 * - If it's already an http URL (legacy) → return as-is
 * - If empty → return ''
 */
async function resolveResumeUrl(rawResumeUrl) {
  if (!rawResumeUrl) return '';
  if (isObjectPath(rawResumeUrl)) {
    try {
      return await getSignedDownloadUrl(rawResumeUrl, 3600);
    } catch (err) {
      log.warn({ err, path: rawResumeUrl }, 'Failed to sign resume URL — returning empty');
      return '';
    }
  }
  return rawResumeUrl; // legacy http URL — pass through
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

  if (isObjectPath(profile.resumeUrl)) {
    const signedUrl = await getSignedDownloadUrl(profile.resumeUrl, 3600);
    return { signedUrl, expiresIn: 3600 };
  }

  // Legacy HTTP URL — return as-is (publicly accessible)
  return { signedUrl: profile.resumeUrl, expiresIn: null };
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
