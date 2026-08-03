import * as aiService from '#services/ai.service.js';
import { asyncHandler } from '#utils/asyncHandler.js';
import { AppError } from '#utils/httpErrors.js';
import { env } from '#config';

function ensureGeminiConfigured(req, res, next) {
  if (!env.GEMINI_API_KEY) {
    return next(AppError.unprocessable('AI features require a Gemini API key (set GEMINI_API_KEY)'));
  }
  next();
}

export const extractResume = [
  ensureGeminiConfigured,
  asyncHandler(async (req, res) => {
    const data = await aiService.extractResumeData(req.user.uid);
    res.json({ data, meta: { requestId: req.id } });
  }),
];

export const reviewResume = [
  ensureGeminiConfigured,
  asyncHandler(async (req, res) => {
    const data = await aiService.reviewResume(req.user.uid, req.body);
    res.json({ data, meta: { requestId: req.id } });
  }),
];

export const matchResume = [
  ensureGeminiConfigured,
  asyncHandler(async (req, res) => {
    const data = await aiService.matchResumeToJob(req.user.uid, req.body);
    res.json({ data, meta: { requestId: req.id } });
  }),
];

export const skillGap = [
  ensureGeminiConfigured,
  asyncHandler(async (req, res) => {
    const data = await aiService.skillGapAnalysis(req.user.uid, req.body);
    res.json({ data, meta: { requestId: req.id } });
  }),
];

export const interviewQuestions = [
  ensureGeminiConfigured,
  asyncHandler(async (req, res) => {
    const data = await aiService.generateInterviewQuestions(req.user.uid, req.body);
    res.json({ data, meta: { requestId: req.id } });
  }),
];

export const coverLetter = [
  ensureGeminiConfigured,
  asyncHandler(async (req, res) => {
    const data = await aiService.generateCoverLetter(req.user.uid, req.body);
    res.json({ data, meta: { requestId: req.id } });
  }),
];

export const careerChat = [
  ensureGeminiConfigured,
  asyncHandler(async (req, res) => {
    const data = await aiService.careerChat(req.user.uid, req.body);
    res.json({ data, meta: { requestId: req.id } });
  }),
];

export const listThreads = [
  ensureGeminiConfigured,
  asyncHandler(async (req, res) => {
    const items = await aiService.listChatThreads(req.user.uid);
    res.json({ data: { items }, meta: { requestId: req.id } });
  }),
];

export const getThreadMessages = [
  ensureGeminiConfigured,
  asyncHandler(async (req, res) => {
    const items = await aiService.getChatMessages(req.params.threadId, req.user.uid);
    res.json({ data: { items }, meta: { requestId: req.id } });
  }),
];
