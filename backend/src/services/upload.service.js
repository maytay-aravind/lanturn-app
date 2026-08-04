import { signUploadUrl, getPublicUrl } from '#clients/storage.client.js';
import { getSignedDownloadUrl } from '#clients/storage.client.js';
import { studentsRepo } from '#repositories/students.repository.js';
import { employersRepo } from '#repositories/employers.repository.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import { callGemini } from '#clients/gemini.client.js';
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
export async function commitUpload(uid, role, { kind, objectPath, fileName }) {
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

  if (kind === UPLOAD_KINDS.CERTIFICATE) {
    // Fetch current student, append to certificates array
    const student = await studentsRepo.getById(uid) || { certificates: [] };
    const newCert = {
      id: crypto.randomUUID(),
      name: fileName || objectPath.split('/').pop(),
      url: objectPath,
      uploadedAt: new Date().toISOString(),
    };
    
    await studentsRepo.ensureAndUpdate(uid, {
      certificates: [...(student.certificates || []), newCert],
    });

    return { objectPath, attachedTo: 'students.me.certificates' };
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

const KEYWORD_EXTRACT_PROMPT = `You are an AI extracting keywords from a resume.
Read the resume text and return a JSON list of the top technical and professional skills.
Output STRICT JSON only matching this schema:
{ "skills": [string] }`;

/**
 * Extract keywords/skills from a newly uploaded resume,
 * then persist them into the `resume_keywords` column for AI scoring.
 * Also saves the resume text summary for Gemini-based analysis.
 */
async function extractAndSaveKeywords(uid, objectPath) {
  try {
    const signedUrl = await getSignedDownloadUrl(objectPath, 600);
    
    // Download PDF from Supabase
    const response = await fetch(signedUrl);
    if (!response.ok) throw new Error(`Failed to download PDF: ${response.status}`);
    const buffer = await response.arrayBuffer();
    
    // Parse PDF text
    const parsedPdf = await pdfParse(Buffer.from(buffer));
    const resumeText = parsedPdf.text;

    // Use Gemini to extract skills/keywords
    const result = await callGemini({
      systemPrompt: KEYWORD_EXTRACT_PROMPT,
      userContent: resumeText,
      responseFormat: true,
      temperature: 0.2,
    });

    const skills = Array.isArray(result?.skills) ? result.skills : [];

    await studentsRepo.ensureAndUpdate(uid, {
      resumeKeywords: skills,
      resumeText,
    });
    log.info({ uid, skillCount: skills.length }, 'Resume keywords and summary saved via Gemini');
  } catch (err) {
    log.warn({ err, uid }, 'Failed to extract resume keywords (non-fatal)');
  }
}
