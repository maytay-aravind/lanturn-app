import * as profileService from '#services/profile.service.js';
import { jobsRepo } from '#repositories/jobs.repository.js';
import { applicationsRepo } from '#repositories/applications.repository.js';
import { asyncHandler } from '#utils/asyncHandler.js';

export const getMe = asyncHandler(async (req, res) => {
  const data = await profileService.getEmployerProfile(req.user.uid);
  res.json({ data, meta: { requestId: req.id } });
});

export const updateMe = asyncHandler(async (req, res) => {
  const data = await profileService.updateEmployerProfile(req.user.uid, req.body);
  res.json({ data, meta: { requestId: req.id } });
});

export const getPublic = asyncHandler(async (req, res) => {
  const data = await profileService.getEmployerPublic(req.params.uid);
  res.json({ data, meta: { requestId: req.id } });
});

/**
 * GET /employers/me/analytics
 * Returns aggregated recruitment analytics for the logged-in employer.
 */
export const getAnalytics = asyncHandler(async (req, res) => {
  const uid = req.user.uid;

  // Fetch all employer jobs
  const jobsResult = await jobsRepo.listByEmployer(uid, { limit: 500 });
  const jobs = jobsResult.items || [];

  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(j => j.status === 'active').length;
  const pausedJobs = jobs.filter(j => j.status === 'paused').length;
  const closedJobs = jobs.filter(j => j.status === 'closed').length;

  // Fetch all applications for employer's jobs
  const jobIds = jobs.map(j => j.jobId);
  let allApplications = [];
  for (const jobId of jobIds) {
    const apps = await applicationsRepo.listByJob(jobId, { limit: 500 });
    allApplications = allApplications.concat(apps);
  }

  const totalApplicants = allApplications.length;
  const statusBreakdown = {
    submitted: allApplications.filter(a => a.status === 'submitted').length,
    reviewed: allApplications.filter(a => a.status === 'reviewed').length,
    shortlisted: allApplications.filter(a => a.status === 'shortlisted').length,
    accepted: allApplications.filter(a => a.status === 'accepted').length,
    rejected: allApplications.filter(a => a.status === 'rejected').length,
    withdrawn: allApplications.filter(a => a.status === 'withdrawn').length,
  };

  // Applications per day (last 30 days)
  const now = new Date();
  const applicationsPerDay = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    applicationsPerDay[d.toISOString().slice(0, 10)] = 0;
  }
  allApplications.forEach(a => {
    const day = new Date(a.createdAt).toISOString().slice(0, 10);
    if (applicationsPerDay[day] !== undefined) {
      applicationsPerDay[day]++;
    }
  });

  // Conversion rate
  const conversionRate = totalApplicants > 0
    ? Math.round((statusBreakdown.accepted / totalApplicants) * 100)
    : 0;

  // Recent applications (last 10)
  const recentApplications = allApplications
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10)
    .map(a => ({
      applicationId: a.applicationId,
      jobTitle: a.jobTitle,
      studentName: a.studentName,
      studentPhotoURL: a.studentPhotoURL,
      status: a.status,
      appliedAt: a.createdAt,
    }));

  res.json({
    data: {
      totalJobs,
      activeJobs,
      pausedJobs,
      closedJobs,
      totalApplicants,
      statusBreakdown,
      applicationsPerDay,
      conversionRate,
      recentApplications,
    },
    meta: { requestId: req.id },
  });
});
