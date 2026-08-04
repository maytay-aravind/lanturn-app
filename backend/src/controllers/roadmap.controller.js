import * as roadmapService from '#services/roadmap.service.js';
import { asyncHandler } from '#utils/asyncHandler.js';

/** GET /roadmaps/domains — list all available career domains */
export const listDomains = asyncHandler(async (req, res) => {
  const data = roadmapService.listDomains();
  res.json({ data, meta: { requestId: req.id } });
});

/** GET /roadmaps/domains/:domainId — get full static domain data */
export const getDomain = asyncHandler(async (req, res) => {
  const data = roadmapService.getDomain(req.params.domainId);
  res.json({ data, meta: { requestId: req.id } });
});

/** GET /roadmaps/me — get all roadmaps for the current student */
export const getMyRoadmaps = asyncHandler(async (req, res) => {
  const data = await roadmapService.getStudentRoadmaps(req.user.uid);
  res.json({ data, meta: { requestId: req.id } });
});

/** POST /roadmaps/me/enroll — enroll in a new domain */
export const enroll = asyncHandler(async (req, res) => {
  const { domainId } = req.body;
  const data = await roadmapService.enrollRoadmap(req.user.uid, domainId);
  res.status(201).json({ data, meta: { requestId: req.id } });
});

/** DELETE /roadmaps/me/:roadmapId — remove an enrollment */
export const removeRoadmap = asyncHandler(async (req, res) => {
  await roadmapService.removeRoadmap(req.user.uid, req.params.roadmapId);
  res.json({ data: { removed: true }, meta: { requestId: req.id } });
});

/** PATCH /roadmaps/me/:roadmapId/progress — toggle topic completion */
export const updateProgress = asyncHandler(async (req, res) => {
  const { stageIndex, topicIndex, completed } = req.body;
  const data = await roadmapService.toggleTopic(
    req.user.uid,
    req.params.roadmapId,
    Number(stageIndex),
    Number(topicIndex),
    Boolean(completed)
  );
  res.json({ data, meta: { requestId: req.id } });
});
