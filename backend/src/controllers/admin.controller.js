import * as adminService from '#services/admin.service.js';
import * as jobService from '#services/job.service.js';
import { asyncHandler } from '#utils/asyncHandler.js';

export const listUsers = asyncHandler(async (req, res) => {
  const { items } = await adminService.listUsers(req.query);
  res.json({ data: { items }, meta: { requestId: req.id } });
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const data = await adminService.updateUserStatus(req.params.uid, req.body.status);
  res.json({ data, meta: { requestId: req.id } });
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const data = await adminService.updateUserRole(req.params.uid, req.body.role);
  res.json({ data, meta: { requestId: req.id } });
});

export const listJobs = asyncHandler(async (req, res) => {
  const items = await jobService.listAllJobs();
  res.json({ data: { items }, meta: { requestId: req.id } });
});

export const moderateJob = asyncHandler(async (req, res) => {
  const data = await jobService.moderateJob(req.params.jobId, req.body.status, req.user.uid);
  res.json({ data, meta: { requestId: req.id } });
});

export const verifyJob = asyncHandler(async (req, res) => {
  const data = await jobService.verifyJob(req.params.jobId, req.user.uid);
  res.json({ data, meta: { requestId: req.id } });
});

export const analyticsSummary = asyncHandler(async (req, res) => {
  const data = await adminService.getAnalyticsSummary();
  res.json({ data, meta: { requestId: req.id } });
});

export const analyticsSeries = asyncHandler(async (req, res) => {
  const data = await adminService.getAnalyticsSeries(req.query);
  res.json({ data, meta: { requestId: req.id } });
});

export const getPlatformConfig = asyncHandler(async (req, res) => {
  const data = await adminService.getPlatformConfig();
  res.json({ data, meta: { requestId: req.id } });
});

export const updatePlatformConfig = asyncHandler(async (req, res) => {
  const data = await adminService.updatePlatformConfig(req.body);
  res.json({ data, meta: { requestId: req.id } });
});
