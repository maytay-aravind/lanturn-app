import { jobsRepo } from '#repositories/jobs.repository.js';
import { employersRepo } from '#repositories/employers.repository.js';
import { studentsRepo } from '#repositories/students.repository.js';
import { notifyNewJob } from '#services/notification.service.js';
import { AppError } from '#utils/httpErrors.js';
import { JOB_STATUS } from '#config';
import { generateId } from '#utils/ids.js';
import { logger_for } from '#utils/logger.js';

const log = logger_for('job.service');

/** Create a job posting */
export async function createJob(employerId, data) {
  const employer = await employersRepo.getById(employerId);
  if (!employer) throw AppError.notFound('Employer profile not found');

  const jobId = generateId('job');
  const doc = {
    ...data,
    employerId,
    companyName: employer.companyName,
    companyLogoURL: employer.logoURL || '',
    requiredSkills: (data.requiredSkills || []).map((s) => s.toLowerCase()),
  };

  const createdJob = await jobsRepo.create(jobId, doc);

  // Background task: notify all students
  if (doc.status === JOB_STATUS.ACTIVE) {
    studentsRepo.getAllUids()
      .then(uids => notifyNewJob(uids, doc.title, doc.companyName, jobId))
      .catch(err => log.error({ err }, 'Failed to notify students of new job'));
  }

  return createdJob;
}

/** Get a single job */
export async function getJob(jobId) {
  const job = await jobsRepo.getById(jobId);
  if (!job) throw AppError.notFound('Job not found');
  return job;
}

/** Update a job (owner only enforced by caller) */
export async function updateJob(jobId, employerId, data) {
  const job = await jobsRepo.getById(jobId);
  if (!job) throw AppError.notFound('Job not found');
  if (job.employerId !== employerId) throw AppError.forbidden('Not your job');

  if (data.requiredSkills) {
    data.requiredSkills = data.requiredSkills.map((s) => s.toLowerCase());
  }

  return jobsRepo.update(jobId, data);
}

/** Soft-delete a job */
export async function removeJob(jobId, employerId) {
  const job = await jobsRepo.getById(jobId);
  if (!job) throw AppError.notFound('Job not found');
  if (job.employerId !== employerId) throw AppError.forbidden('Not your job');

  return jobsRepo.update(jobId, { status: JOB_STATUS.REMOVED });
}

/** Browse active jobs */
export async function listJobs(query) {
  return jobsRepo.listActive(query);
}

/** Employer's own jobs */
export async function listEmployerJobs(employerId, query) {
  return jobsRepo.listByEmployer(employerId, query);
}

/** Admin: list all jobs */
export async function listAllJobs() {
  return jobsRepo.listAll();
}

/** Admin: moderate a job */
export async function moderateJob(jobId, status, adminUid) {
  const job = await jobsRepo.getById(jobId);
  if (!job) throw AppError.notFound('Job not found');
  const update = { status };
  // If setting to active/verified, auto-verify
  if (status === JOB_STATUS.ACTIVE || status === JOB_STATUS.VERIFIED) {
    update.verifiedByAdmin = true;
    update.verifiedAt = new Date().toISOString();
    update.verifiedBy = adminUid;
  }
  return jobsRepo.update(jobId, update);
}

/** Admin: explicitly verify a job */
export async function verifyJob(jobId, adminUid) {
  const job = await jobsRepo.getById(jobId);
  if (!job) throw AppError.notFound('Job not found');
  return jobsRepo.update(jobId, {
    verifiedByAdmin: true,
    verifiedAt: new Date().toISOString(),
    verifiedBy: adminUid,
    status: JOB_STATUS.VERIFIED,
  });
}

/** Increment application count (called inside a transaction by application service) */
export async function incrementApplicationCount(jobId) {
  const job = await jobsRepo.getById(jobId);
  if (!job) return;
  await jobsRepo.update(jobId, { applicationCount: (job.applicationCount || 0) + 1 });
}

/** Decrement application count on withdrawal */
export async function decrementApplicationCount(jobId) {
  const job = await jobsRepo.getById(jobId);
  if (!job) return;
  await jobsRepo.update(jobId, { applicationCount: Math.max(0, (job.applicationCount || 0) - 1) });
}
