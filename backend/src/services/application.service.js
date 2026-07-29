import { applicationsRepo } from '#repositories/applications.repository.js';
import { jobsRepo } from '#repositories/jobs.repository.js';
import { studentsRepo } from '#repositories/students.repository.js';
import { AppError } from '#utils/httpErrors.js';
import { APPLICATION_STATUS, JOB_STATUS } from '#config';
import { applicationIdFor } from '#utils/ids.js';
import { logger_for } from '#utils/logger.js';

const log = logger_for('application.service');

/** Student applies to a job */
export async function applyToJob(studentId, jobId, { coverLetter, resumeUrl }) {
  // Check job is active and open
  const job = await jobsRepo.getById(jobId);
  if (!job) throw AppError.notFound('Job not found');
  if (job.status !== JOB_STATUS.ACTIVE) throw AppError.unprocessable('Job is not accepting applications');
  if (job.deadline && new Date(job.deadline) < new Date()) {
    throw AppError.unprocessable('Application deadline has passed');
  }

  // Check no existing active application
  const existing = await applicationsRepo.getActiveByStudentAndJob(studentId, jobId);
  const active = existing.find(
    (a) => a.status !== APPLICATION_STATUS.WITHDRAWN
  );
  if (active) throw AppError.conflict('Already applied to this job');

  // Snapshot student data
  const student = await studentsRepo.getById(studentId);
  const applicationId = applicationIdFor(studentId, jobId);

  const data = {
    jobId,
    jobTitle: job.title,
    employerId: job.employerId,
    studentId,
    studentName: student?.personal?.name || studentId,
    studentPhotoURL: student?.profilePhotoURL || '',
    resumeUrl: resumeUrl || student?.resumeUrl || '',
    resumeTextSnapshot: student?.resumeText || '',
    skillsSnapshot: student?.searchableSkills || [],
    coverLetter: coverLetter || '',
  };

  const app = await applicationsRepo.create(applicationId, data);

  // Increment counter (fire-and-forget)
  jobsRepo.update(jobId, {
    applicationCount: (job.applicationCount || 0) + 1,
  }).catch((err) => log.error({ err }, 'Failed to increment counter'));

  return app;
}

/** Student's own applications */
export async function listMyApplications(studentId, query) {
  return applicationsRepo.listByStudent(studentId, query);
}

/** Employer views applicants for a job */
export async function listJobApplicants(employerId, jobId, query) {
  const job = await jobsRepo.getById(jobId);
  if (!job) throw AppError.notFound('Job not found');
  if (job.employerId !== employerId) throw AppError.forbidden('Not your job');
  return applicationsRepo.listByJob(jobId, query);
}

/** Employer/admin updates status */
export async function updateApplicationStatus(applicationId, newStatus, byUid) {
  const app = await applicationsRepo.getById(applicationId);
  if (!app) throw AppError.notFound('Application not found');
  return applicationsRepo.updateStatus(applicationId, newStatus, byUid);
}

/** Student withdraws */
export async function withdrawApplication(applicationId, studentId) {
  const app = await applicationsRepo.getById(applicationId);
  if (!app) throw AppError.notFound('Application not found');
  if (app.studentId !== studentId) throw AppError.forbidden('Not your application');

  await applicationsRepo.updateStatus(applicationId, APPLICATION_STATUS.WITHDRAWN, studentId);

  // Decrement job counter
  jobsRepo.update(app.jobId, {
    applicationCount: Math.max(0, (app.applicationCount || 0) - 1),
  }).catch(() => {});

  return applicationsRepo.getById(applicationId);
}

/** Get single application */
export async function getApplication(applicationId) {
  const app = await applicationsRepo.getById(applicationId);
  if (!app) throw AppError.notFound('Application not found');
  return app;
}
