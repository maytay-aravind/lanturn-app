import { Router } from 'express';
import { authenticate, requireRole, requireProfileComplete } from '#middlewares';
import { asyncHandler } from '#utils/asyncHandler.js';
import { parseResume, reviewResume, matchResume } from '#clients/magical.client.js';
import { studentsRepo } from '#repositories/students.repository.js';
import { jobsRepo } from '#repositories/jobs.repository.js';
import { AppError } from '#utils/httpErrors.js';

const router = Router();
const guard = [authenticate, requireRole('student'), requireProfileComplete];

/**
 * POST /api/magical/resume-parse
 * Parse the student's uploaded resume and return structured data.
 */
router.post(
  '/resume-parse',
  ...guard,
  asyncHandler(async (req, res) => {
    const student = await studentsRepo.getById(req.user.uid);
    if (!student?.resumeUrl) throw AppError.unprocessable('Upload a resume first');
    const data = await parseResume(student.resumeUrl);
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
    if (!student?.resumeUrl) throw AppError.unprocessable('Upload a resume first');
    const data = await reviewResume(student.resumeUrl);
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
    if (!student?.resumeUrl) throw AppError.unprocessable('Upload a resume first');

    let description = jobDescription;
    if (!description && jobId) {
      const job = await jobsRepo.getById(jobId);
      if (!job) throw AppError.notFound('Job not found');
      description = `${job.title}\n${job.description}\nRequirements: ${job.requirements?.join(', ')}\nSkills: ${job.requiredSkills?.join(', ')}`;
    }
    if (!description) throw AppError.validation('Provide jobId or jobDescription');

    const data = await matchResume(student.resumeUrl, description);
    res.json({ data, meta: { requestId: req.id } });
  })
);

export default router;
