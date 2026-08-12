import * as roadmapService from '#services/roadmap.service.js';
import * as resumeAnalyzerService from '#services/resumeAnalyzer.service.js';
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

/** POST /roadmaps/analyze-resume — AI resume gap analysis against a career domain */
export const analyzeResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: { code: 'MISSING_FILE', message: 'Please upload a PDF resume.' } });
  }
  const domainId = req.body.domainId;
  if (!domainId) {
    return res.status(400).json({ error: { code: 'MISSING_DOMAIN', message: 'Please select a target career domain.' } });
  }

  const data = await resumeAnalyzerService.analyzeResumeGap(req.file.buffer, domainId);
  res.json({ data, meta: { requestId: req.id } });
});

/** POST /roadmaps/sync-resume-progress — batch-complete matched topics from resume analysis */
export const syncResumeTopics = asyncHandler(async (req, res) => {
  const { roadmapId, topicKeys } = req.body;
  if (!roadmapId || !Array.isArray(topicKeys) || topicKeys.length === 0) {
    return res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'roadmapId and topicKeys[] are required.' } });
  }

  let synced = 0;
  for (const key of topicKeys) {
    const [si, ti] = key.split('-').map(Number);
    if (!isNaN(si) && !isNaN(ti)) {
      await roadmapService.toggleTopic(req.user.uid, roadmapId, si, ti, true);
      synced++;
    }
  }

  res.json({ data: { synced, roadmapId }, meta: { requestId: req.id } });
});
