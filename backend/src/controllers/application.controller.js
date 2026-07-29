import * as appService from '#services/application.service.js';
import * as notifService from '#services/notification.service.js';
import * as jobService from '#services/job.service.js';
import { employersRepo } from '#repositories/employers.repository.js';
import { usersRepo } from '#repositories/users.repository.js';
import { asyncHandler } from '#utils/asyncHandler.js';
import { ROLES, APPLICATION_STATUS, NOTIFICATION_TYPE } from '#config';

export const apply = asyncHandler(async (req, res) => {
  const app = await appService.applyToJob(req.user.uid, req.params.jobId, req.body);

  // Notify employer
  const employerUser = await usersRepo.getById(app.employerId);
  await notifService.notifyApplicationReceived(
    app.employerId,
    employerUser?.email,
    app.jobTitle,
    app.studentName,
    app.jobId
  );

  res.status(201).json({ data: app, meta: { requestId: req.id } });
});

export const listMine = asyncHandler(async (req, res) => {
  const query = { ...req.query, limit: parseInt(req.query.limit || 50, 10) };
  const items = await appService.listMyApplications(req.user.uid, query);
  res.json({ data: { items }, meta: { requestId: req.id } });
});

export const listForJob = asyncHandler(async (req, res) => {
  const query = { ...req.query, limit: parseInt(req.query.limit || 50, 10) };
  const items = await appService.listJobApplicants(req.user.uid, req.params.jobId, query);
  res.json({ data: { items }, meta: { requestId: req.id } });
});

export const getOne = asyncHandler(async (req, res) => {
  const app = await appService.getApplication(req.params.applicationId);

  // Authorization: student owner, employer (job owner), or admin
  const isStudent = req.user.uid === app.studentId;
  const isAdmin = req.user.role === ROLES.ADMIN;
  let isEmployer = false;
  if (req.user.role === ROLES.EMPLOYER) {
    const job = await jobService.getJob(app.jobId);
    isEmployer = job.employerId === req.user.uid;
  }
  if (!isStudent && !isEmployer && !isAdmin) {
    return res.status(403).json({
      error: { code: 'FORBIDDEN', message: 'Not allowed' },
      meta: { requestId: req.id },
    });
  }

  res.json({ data: app, meta: { requestId: req.id } });
});

export const updateStatus = asyncHandler(async (req, res) => {
  const { applicationId } = req.params;
  const { status } = req.body;

  const app = await appService.getApplication(applicationId);

  // Authorization for employer
  let allowed = req.user.role === ROLES.ADMIN;
  if (req.user.role === ROLES.EMPLOYER) {
    const job = await jobService.getJob(app.jobId);
    allowed = job.employerId === req.user.uid;
  }
  if (!allowed) {
    return res.status(403).json({
      error: { code: 'FORBIDDEN', message: 'Not allowed' },
      meta: { requestId: req.id },
    });
  }

  const updated = await appService.updateApplicationStatus(applicationId, status, req.user.uid);

  // Notify student
  const studentUser = await usersRepo.getById(app.studentId);
  await notifService.notifyApplicationStatus(
    app.studentId,
    studentUser?.email,
    app.jobTitle,
    status
  );

  res.json({ data: updated, meta: { requestId: req.id } });
});

export const withdraw = asyncHandler(async (req, res) => {
  const app = await appService.withdrawApplication(req.params.applicationId, req.user.uid);
  res.json({ data: app, meta: { requestId: req.id } });
});
