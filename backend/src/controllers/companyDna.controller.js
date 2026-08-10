import * as companyDnaService from '#services/companyDna.service.js';
import { asyncHandler } from '#utils/asyncHandler.js';
import { AppError } from '#utils/httpErrors.js';
import { env } from '#config';

function ensureGeminiConfigured(req, res, next) {
  if (!env.GEMINI_API_KEY) {
    return next(AppError.unprocessable('AI features require a Gemini API key (set GEMINI_API_KEY)'));
  }
  next();
}

/**
 * POST /employers/company-dna/generate
 * Generate (or regenerate) Company DNA via Gemini. Employer-only.
 */
export const generate = [
  ensureGeminiConfigured,
  asyncHandler(async (req, res) => {
    const data = await companyDnaService.generateCompanyDna(req.user.uid);
    res.json({ data, meta: { requestId: req.id } });
  }),
];

/**
 * GET /employers/me/company-dna
 * Get stored Company DNA for the logged-in employer (dashboard preview).
 */
export const getPreview = [
  asyncHandler(async (req, res) => {
    const data = await companyDnaService.getCompanyDna(req.user.uid);
    res.json({ data, meta: { requestId: req.id } });
  }),
];

/**
 * GET /employers/:uid/company-dna
 * Get public Company DNA for a given employer (student view). No auth required.
 */
export const getPublic = [
  asyncHandler(async (req, res) => {
    const data = await companyDnaService.getPublicCompanyDna(req.params.uid);
    res.json({ data, meta: { requestId: req.id } });
  }),
];
