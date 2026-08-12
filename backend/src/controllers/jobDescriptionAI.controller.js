
import { generateJobDescription } from '#services/jobDescriptionAI.service.js';
import { asyncHandler } from '#utils/asyncHandler.js';

/**
 * POST /employers/ai/generate-job-description
 * Generate a professional job description using AI.
 */
export const generate = asyncHandler(async (req, res) => {
  const { title, jobType, experienceLevel, workMode, department, industry } = req.body;

  const result = await generateJobDescription({
    title,
    jobType,
    experienceLevel,
    workMode,
    department,
    industry,
  });

  res.json({
    data: result,
    meta: { requestId: req.id },
  });
});


