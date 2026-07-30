import { Router } from 'express';
import { authenticate, requireRole, requireProfileComplete } from '#middlewares';
import { asyncHandler } from '#utils/asyncHandler.js';
import { parseResumeBytes, parseResume, reviewResume, matchResume } from '#clients/magical.client.js';
import { studentsRepo } from '#repositories/students.repository.js';
import { jobsRepo } from '#repositories/jobs.repository.js';
import { supabase } from '#supabase';
import { getSignedDownloadUrl } from '#clients/storage.client.js';
import { AppError } from '#utils/httpErrors.js';
import { logger_for } from '#utils/logger.js';

const log = logger_for('magical.routes');
const router = Router();
const guard = [authenticate, requireRole('student'), requireProfileComplete];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Download raw PDF bytes from Supabase storage using the admin client.
 * This is the recommended approach for private buckets — avoids passing
 * a signed URL to an external service (which may be unreachable or time out).
 */
async function downloadResumeBytes(objectPath) {
  const { data, error } = await supabase.storage
    .from('resumes')
    .download(objectPath);

  if (error) {
    log.error({ error, objectPath }, 'Failed to download resume from storage');
    throw new Error(`Storage download failed: ${error.message}`);
  }

  const arrayBuffer = await data.arrayBuffer();
  const filename = objectPath.split('/').pop() || 'resume.pdf';
  return { bytes: new Uint8Array(arrayBuffer), filename };
}

/**
 * Resolve the student's stored resumeUrl to an accessible HTTPS URL.
 * Used for review/match endpoints that pass a URL to external services.
 */
async function getAccessibleResumeUrl(student) {
  const raw = student?.resumeUrl;
  if (!raw) throw AppError.unprocessable('Upload a resume first');
  if (!raw.startsWith('http')) {
    return getSignedDownloadUrl(raw, 600); // 10-min URL is enough for one API call
  }
  return raw; // legacy public URL
}

// ─── Routes ──────────────────────────────────────────────────────────────────

/**
 * POST /api/magical/resume-parse
 * Parse the student's uploaded resume and return structured data.
 */
router.post(
  '/resume-parse',
  ...guard,
  asyncHandler(async (req, res) => {
    const student = await studentsRepo.getById(req.user.uid);
    const resumeUrl = await getAccessibleResumeUrl(student);
    const data = await parseResume(resumeUrl);
    res.json({ data, meta: { requestId: req.id } });
  })
);

/**
 * POST /api/magical/resume-review
 * Get AI quality review (ATS score + feedback) for the student's resume.
 */
router.post(
  '/resume-review',
  ...guard,
  asyncHandler(async (req, res) => {
    const student = await studentsRepo.getById(req.user.uid);
    const resumeUrl = await getAccessibleResumeUrl(student);
    const data = await reviewResume(resumeUrl);
    res.json({ data, meta: { requestId: req.id } });
  })
);

/**
 * POST /api/magical/resume-match
 * Score how well the student's resume matches a specific job.
 */
router.post(
  '/resume-match',
  ...guard,
  asyncHandler(async (req, res) => {
    const { jobId, jobDescription } = req.body;
    const student = await studentsRepo.getById(req.user.uid);
    const resumeUrl = await getAccessibleResumeUrl(student);

    let description = jobDescription;
    if (!description && jobId) {
      const job = await jobsRepo.getById(jobId);
      if (!job) throw AppError.notFound('Job not found');
      description = `${job.title}\n${job.description}\nRequirements: ${job.requirements?.join(', ')}\nSkills: ${job.requiredSkills?.join(', ')}`;
    }
    if (!description) throw AppError.validation('Provide jobId or jobDescription');

    const data = await matchResume(resumeUrl, description);
    res.json({ data, meta: { requestId: req.id } });
  })
);

/**
 * POST /api/magical/resume-extract
 *
 * Downloads the PDF directly from Supabase storage (bypassing signed URL issues),
 * sends it to MagicalAPI as a multipart upload, then maps the response to our
 * profile schema for the frontend auto-fill form.
 *
 * Actual MagicalAPI /resume/parser response shape:
 * {
 *   data: {
 *     contact:    { name, email, phone, linkedin, github, location: { city, state, country } },
 *     educations: [{ institution, degree, field_of_study, start_date, end_date, gpa }],
 *     experiences:[{ company, title, start_date, end_date, description }],
 *     skills:     [{ name }],
 *     summary:    string,
 *     usage:      { credits: number }
 *   }
 * }
 */
router.post(
  '/resume-extract',
  ...guard,
  asyncHandler(async (req, res) => {
    const student = await studentsRepo.getById(req.user.uid);
    const rawPath = student?.resumeUrl;
    if (!rawPath) throw AppError.unprocessable('Upload a resume first');

    let parsed;

    if (!rawPath.startsWith('http')) {
      // Private bucket objectPath (new format) — download bytes, send as multipart
      const { bytes, filename } = await downloadResumeBytes(rawPath);
      parsed = await parseResumeBytes(bytes, filename);
    } else {
      // Legacy full HTTP URL — pass directly (pre-fix rows only)
      parsed = await parseResume(rawPath);
    }

    log.info({ uid: req.user.uid, topKeys: Object.keys(parsed ?? {}) }, 'MagicalAPI raw response received');

    // MagicalAPI wraps everything in a `data` key
    const r = parsed?.data ?? parsed ?? {};

    // ── Contact / personal ──────────────────────────────────────────────────
    const contact  = r.contact  ?? {};
    const location = contact.location ?? r.location ?? {};

    // ── Education ───────────────────────────────────────────────────────────
    // Plural "educations" is the documented key; fall back to singular for safety
    const educations = Array.isArray(r.educations) ? r.educations
      : Array.isArray(r.education) ? r.education
      : [];
    const edu = educations[0] ?? null;

    // end_date may be "2025", "May 2025", or "2025-05" — extract a 4-digit year
    const rawGradYear = edu?.end_date ?? edu?.graduation_year ?? edu?.end_year ?? null;
    const graduationYear = rawGradYear
      ? parseInt(String(rawGradYear).match(/\b(20\d{2}|19\d{2})\b/)?.[1] ?? '', 10) || null
      : null;

    const cgpaRaw = edu?.gpa ?? edu?.cgpa ?? null;
    const cgpa = cgpaRaw
      ? parseFloat(String(cgpaRaw).replace(/[^0-9.]/g, '')) || null
      : null;

    // ── Skills ──────────────────────────────────────────────────────────────
    // MagicalAPI returns skills as [{ name: "Python" }] — not plain strings
    const rawSkills = Array.isArray(r.skills) ? r.skills : [];
    const skills = rawSkills
      .map((s) => (typeof s === 'string' ? s : s?.name ?? ''))
      .filter(Boolean)
      .slice(0, 50);

    // ── Social links ────────────────────────────────────────────────────────
    const linkedin  = contact.linkedin  ?? r.linkedin_url  ?? r.linkedin  ?? '';
    const github    = contact.github    ?? r.github_url    ?? r.github    ?? '';
    const portfolio = r.portfolio_url   ?? contact.portfolio ?? '';

    const extracted = {
      personal: {
        ...(contact.name     && { name:  contact.name }),
        ...(contact.phone    && { phone: contact.phone }),
        ...(location.city    && { city:  location.city }),
        ...(location.state   && { state: location.state }),
      },
      academic: {
        ...(edu?.institution    && { college:        edu.institution }),
        ...(edu?.degree         && { degree:         edu.degree }),
        ...(edu?.field_of_study && { branch:         edu.field_of_study }),
        ...(graduationYear      && { graduationYear }),
        ...(cgpa !== null       && { cgpa }),
      },
      professional: {
        ...(skills.length && { skills }),
      },
      social: {
        ...(linkedin  && { linkedin }),
        ...(github    && { github }),
        ...(portfolio && { portfolio }),
      },
    };

    log.info({ uid: req.user.uid, hasName: !!contact.name, skillCount: skills.length }, 'Resume extracted OK');
    res.json({ data: extracted, meta: { requestId: req.id } });
  })
);

export default router;
