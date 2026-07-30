import { Router } from 'express';
import { authenticate, requireRole, requireProfileComplete } from '#middlewares';
import { asyncHandler } from '#utils/asyncHandler.js';
import { parseResume, reviewResume, matchResume } from '#clients/magical.client.js';
import { studentsRepo } from '#repositories/students.repository.js';
import { jobsRepo } from '#repositories/jobs.repository.js';
import { getSignedDownloadUrl } from '#clients/storage.client.js';
import { AppError } from '#utils/httpErrors.js';
import { logger_for } from '#utils/logger.js';

const log = logger_for('magical.routes');
const router = Router();
const guard = [authenticate, requireRole('student'), requireProfileComplete];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Normalise a legacy full Supabase URL to an object path.
 * e.g. "https://project.supabase.co/storage/v1/object/public/resumes/resumes/uid/file.pdf"
 *   →   "resumes/uid/file.pdf"
 */
function toObjectPath(rawUrl) {
  if (!rawUrl || !rawUrl.startsWith('http')) return rawUrl;
  try {
    const url = new URL(rawUrl);
    const match = url.pathname.match(/^\/storage\/v1\/object\/(?:public|signed)\/[^/]+\/(.+)$/);
    if (match) return match[1];
  } catch { /* not a valid URL */ }
  return rawUrl;
}

/**
 * Resolve the student's stored resumeUrl to an object path.
 * Handles both new format (object path) and legacy format (full Supabase URL).
 */
function resolveObjectPath(student) {
  const raw = student?.resumeUrl;
  if (!raw) return null;
  if (!raw.startsWith('http')) return raw; // already an object path
  return toObjectPath(raw);
}

/**
 * Resolve the student's stored resumeUrl to a short-lived signed HTTPS URL.
 * MagicalAPI downloads the PDF from this URL, so it must be accessible for the
 * duration of the parse call (~10 minutes is plenty).
 */
async function getAccessibleResumeUrl(student) {
  const objectPath = resolveObjectPath(student);
  if (!objectPath) throw AppError.unprocessable('Upload a resume first');
  return getSignedDownloadUrl(objectPath, 600); // 10-min URL
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
    if (description.length < 100 || description.length > 5000) {
      throw AppError.validation('Job description must be between 100 and 5000 characters');
    }

    const data = await matchResume(resumeUrl, description);
    res.json({ data, meta: { requestId: req.id } });
  })
);

/**
 * POST /api/magical/resume-extract
 *
 * Parses the student's resume via MagicalAPI and maps the response to our
 * profile schema so the frontend auto-fill form can populate fields.
 *
 * Real MagicalAPI /resume-parser response shape:
 * {
 *   data: {
 *     basic: { first_name, last_name, email, phone_number, location,
 *              linkedin_url, github_url, portfolio_website_url, job_title,
 *              majors, university, graduation_year },
 *     educations:    [{ school, degree, field, start:{year,month}, end:{year,month} }],
 *     work_experiences: [{ ... }],
 *     skills:        [{ name }],
 *     summary:       string,
 *   },
 *   usage: { credits }
 * }
 */
router.post(
  '/resume-extract',
  ...guard,
  asyncHandler(async (req, res) => {
    const student = await studentsRepo.getById(req.user.uid);
    const resumeUrl = await getAccessibleResumeUrl(student);

    const parsed = await parseResume(resumeUrl);
    log.info({ uid: req.user.uid, topKeys: Object.keys(parsed ?? {}) }, 'MagicalAPI raw response received');

    const r = parsed?.data ?? parsed ?? {};
    const basic = r.basic ?? {};

    // ── Name ──────────────────────────────────────────────────────────────
    const fullName = [basic.first_name, basic.last_name].filter(Boolean).join(' ').trim();

    // ── Education ─────────────────────────────────────────────────────────
    const educations = Array.isArray(r.educations) ? r.educations : [];
    const edu = educations[0] ?? null;
    const gradYearRaw = basic.graduation_year ?? edu?.end?.year ?? edu?.end_year ?? null;
    const graduationYear = gradYearRaw
      ? parseInt(String(gradYearRaw).match(/\b(20\d{2}|19\d{2})\b/)?.[1] ?? '', 10) || null
      : null;

    // ── Skills ────────────────────────────────────────────────────────────
    // MagicalAPI returns skills as [{ name: "Python" }]
    const rawSkills = Array.isArray(r.skills) ? r.skills : [];
    const skills = rawSkills
      .map((s) => (typeof s === 'string' ? s : s?.name ?? ''))
      .filter(Boolean)
      .slice(0, 50);

    // ── Social links ──────────────────────────────────────────────────────
    const linkedin = normalizeUrl(basic.linkedin_url);
    const github = normalizeUrl(basic.github_url);
    const portfolio = normalizeUrl(basic.portfolio_website_url);

    const extracted = {
      personal: {
        ...(fullName && { name: fullName }),
        ...(basic.phone_number && { phone: basic.phone_number }),
        ...(basic.location && { city: basic.location }),
      },
      academic: {
        ...(basic.university || edu?.school ? { college: basic.university || edu.school } : {}),
        ...(basic.majors || edu?.field ? { branch: basic.majors || edu.field } : {}),
        ...(edu?.degree && { degree: edu.degree }),
        ...(graduationYear && { graduationYear }),
      },
      professional: {
        ...(skills.length && { skills }),
      },
      social: {
        ...(linkedin && { linkedin }),
        ...(github && { github }),
        ...(portfolio && { portfolio }),
      },
    };

    log.info({ uid: req.user.uid, hasName: !!fullName, skillCount: skills.length }, 'Resume extracted OK');
    res.json({ data: extracted, meta: { requestId: req.id } });
  })
);

/**
 * MagicalAPI sometimes returns raw handles (e.g. "maytay-aravind") instead of
 * full URLs for social links. Only keep values that look like real URLs so we
 * don't pollute the profile with garbage.
 */
function normalizeUrl(value) {
  if (!value || typeof value !== 'string') return '';
  const v = value.trim();
  if (!v) return '';
  if (/^https?:\/\//i.test(v)) return v;
  return ''; // not a usable URL
}

export default router;
