import { candidateMatchesRepo } from '#repositories/candidateMatches.repository.js';
import { jobsRepo } from '#repositories/jobs.repository.js';
import { asyncHandler } from '#utils/asyncHandler.js';
import { AppError } from '#utils/httpErrors.js';

/**
 * GET /employers/jobs/:jobId/matches
 * Returns AI candidate matches for a specific job, ordered by score.
 */
export const getJobCandidateMatches = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const uid = req.user.uid;

  // Verify the employer owns this job
  const job = await jobsRepo.getById(jobId);
  if (!job) throw AppError.notFound('Job not found');
  if (job.employerId !== uid) throw AppError.forbidden('Not your job');

  // Fetch matches
  const limit = parseInt(req.query.limit, 10) || 50;
  const matches = await candidateMatchesRepo.listByJob(jobId, { limit });

  res.json({
    data: matches,
    meta: { requestId: req.id, count: matches.length }
  });
});

/**
 * GET /employers/me/recommendations
 * Returns top AI candidate matches across all employer jobs.
 */
export const getTopRecommendations = asyncHandler(async (req, res) => {
  const uid = req.user.uid;
  
  // 1. Get all jobs for employer
  const jobsResult = await jobsRepo.listByEmployer(uid, { limit: 100 });
  const jobs = jobsResult.items || [];
  const jobIds = jobs.map(j => j.jobId);
  
  if (jobIds.length === 0) {
    return res.json({ data: [], meta: { requestId: req.id } });
  }

  // 2. Fetch all matches for these jobs
  const allMatches = await candidateMatchesRepo.listByJobs(jobIds, { limit: 20 });
  
  res.json({
    data: allMatches,
    meta: { requestId: req.id, count: allMatches.length }
  });
});
