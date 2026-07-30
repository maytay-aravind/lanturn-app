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

/**
 * Resolve the student's stored resumeUrl to a real accessible URL.
 * resume_url in the DB stores an objectPath (e.g. "resumes/uid/resume-xyz.pdf")
 * for private-bucket files. MagicalAPI needs a real HTTPS URL, so we
 * generate a short-lived signed URL before every external call.
 */
async function getAccessibleResumeUrl(student) {
  const raw = student?.resumeUrl;
  if (!raw) throw AppError.unprocessable('Upload a resume first');

  // objectPath (stored after the last storage fix)
  if (!raw.startsWith('http')) {
    return getSignedDownloadUrl(raw, 600); // 10-minute URL is enough for API call
  }
  // legacy full HTTP URL (pre-fix rows)
  return raw;
}

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
 * Body: { jobId: string }
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
 * Parse the resume and map the structured fields into our profile schema
 * so the frontend can auto-fill the profile form.
 * Returns: { personal, academic, professional, social }
 */
router.post(
  '/resume-extract',
  ...guard,
  asyncHandler(async (req, res) => {
    const student = await studentsRepo.getById(req.user.uid);
    const resumeUrl = await getAccessibleResumeUrl(student);
    const parsed = await parseResume(resumeUrl);

    // Map MagicalAPI response → our nested profile shape.
    // The MagicalAPI response structure varies; we defensively access each field.
    const p = parsed?.data ?? parsed ?? {};

    const skills = [
      ...(p.skills ?? []),
      ...(p.technical_skills ?? []),
      ...(p.soft_skills ?? []),
    ]
      .map((s) => (typeof s === 'string' ? s : s?.name ?? ''))
      .filter(Boolean)
      .slice(0, 50);

    const linkedin = p.linkedin_url ?? p.linkedin ?? p.social?.linkedin ?? '';
    const github   = p.github_url  ?? p.github  ?? p.social?.github   ?? '';

    const edu = Array.isArray(p.education) ? p.education[0] : null;
    const graduationYear = edu?.graduation_year ?? edu?.end_year ?? null;
    const cgpaRaw = edu?.gpa ?? edu?.cgpa ?? null;
    const cgpa = cgpaRaw ? parseFloat(String(cgpaRaw).replace(/[^0-9.]/g, '')) || null : null;

    const extracted = {
      personal: {
        ...(p.name  && { name:  p.name }),
        ...(p.phone && { phone: p.phone }),
        ...(p.location?.city  && { city:  p.location.city }),
        ...(p.location?.state && { state: p.location.state }),
      },
      academic: {
        ...(edu?.institution  && { college:        edu.institution }),
        ...(edu?.degree       && { degree:         edu.degree }),
        ...(edu?.field        && { branch:         edu.field }),
        ...(graduationYear    && { graduationYear: Number(graduationYear) }),
        ...(cgpa !== null     && { cgpa }),
      },
      professional: {
        ...(skills.length && { skills }),
      },
      social: {
        ...(linkedin && { linkedin }),
        ...(github   && { github }),
        ...(p.portfolio_url && { portfolio: p.portfolio_url }),
      },
    };

    log.info({ uid: req.user.uid }, 'Resume extracted for profile auto-fill');
    res.json({ data: extracted, meta: { requestId: req.id } });
  })
);

export default router;
