import { signUploadUrl, getPublicUrl } from '#clients/storage.client.js';
import { getSignedDownloadUrl } from '#clients/storage.client.js';
import { studentsRepo } from '#repositories/students.repository.js';
import { employersRepo } from '#repositories/employers.repository.js';
import { parseResume } from '#clients/magical.client.js';
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

    // Fire-and-forget: extract keywords from the new resume in background
    extractAndSaveKeywords(uid, objectPath).catch((err) => {
      log.warn({ err, uid }, 'Background resume keyword extraction failed');
    });

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

/**
 * Extract keywords/skills from a newly uploaded resume via MagicalAPI,
 * then persist them into the `resume_keywords` column for AI scoring.
 * Also saves the resume text summary for Gemini-based analysis.
 */
async function extractAndSaveKeywords(uid, objectPath) {
  try {
    const signedUrl = await getSignedDownloadUrl(objectPath, 600);
    const parsed = await parseResume(signedUrl);

    const r = parsed?.data ?? parsed ?? {};
    const basic = r.basic ?? {};

    // Extract skills
    const rawSkills = Array.isArray(r.skills) ? r.skills : [];
    const skills = rawSkills
      .map((s) => (typeof s === 'string' ? s : s?.name ?? ''))
      .filter(Boolean)
      .slice(0, 100);

    // Build a text summary for Gemini (from available fields)
    const fullName = [basic.first_name, basic.last_name].filter(Boolean).join(' ');
    const educations = Array.isArray(r.educations) ? r.educations : [];
    const experiences = Array.isArray(r.work_experiences) ? r.work_experiences : [];

    const textParts = [];
    if (fullName) textParts.push(`Name: ${fullName}`);
    if (basic.job_title) textParts.push(`Current Role: ${basic.job_title}`);
    if (basic.university) textParts.push(`University: ${basic.university}`);
    if (basic.majors) textParts.push(`Major: ${basic.majors}`);
    if (educations.length) {
      textParts.push('Education: ' + educations.map(e =>
        [e.degree, e.field, e.school].filter(Boolean).join(' - ')
      ).join('; '));
    }
    if (experiences.length) {
      textParts.push('Experience: ' + experiences.map(e =>
        [e.job_title, e.company].filter(Boolean).join(' at ')
      ).join('; '));
    }
    if (skills.length) textParts.push(`Skills: ${skills.join(', ')}`);
    if (r.summary) textParts.push(`Summary: ${r.summary}`);

    const resumeText = textParts.join('\n');

    await studentsRepo.ensureAndUpdate(uid, {
      resumeKeywords: skills,
      resumeText: resumeText,
    });

    log.info({ uid, keywordCount: skills.length }, 'Resume keywords extracted and saved');
  } catch (err) {
    log.error({ err, uid }, 'Failed to extract resume keywords');
    throw err;
  }
}

