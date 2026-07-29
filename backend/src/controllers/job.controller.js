import * as jobService from '#services/job.service.js';
import { asyncHandler } from '#utils/asyncHandler.js';

export const list = asyncHandler(async (req, res) => {
  const query = { ...req.query, limit: parseInt(req.query.limit || 10, 10) };
  const result = await jobService.listJobs(query);
  res.json({ data: result, meta: { requestId: req.id } });
});

export const get = asyncHandler(async (req, res) => {
  const data = await jobService.getJob(req.params.jobId);
  res.json({ data, meta: { requestId: req.id } });
});

export const create = asyncHandler(async (req, res) => {
  const data = await jobService.createJob(req.user.uid, req.body);
  res.status(201).json({ data, meta: { requestId: req.id } });
});

export const update = asyncHandler(async (req, res) => {
  const data = await jobService.updateJob(req.params.jobId, req.user.uid, req.body);
  res.json({ data, meta: { requestId: req.id } });
});

export const remove = asyncHandler(async (req, res) => {
  await jobService.removeJob(req.params.jobId, req.user.uid);
  res.json({ data: { ok: true }, meta: { requestId: req.id } });
});

export const listMine = asyncHandler(async (req, res) => {
  const query = { ...req.query, limit: parseInt(req.query.limit || 10, 10) };
  const result = await jobService.listEmployerJobs(req.user.uid, query);
  res.json({ data: result, meta: { requestId: req.id } });
});
