import { Router } from 'express';
import { authenticate } from '#middlewares';
import { asyncHandler } from '#utils/asyncHandler.js';
import { searchJooble } from '#clients/jooble.client.js';

const router = Router();

/**
 * POST /api/jobs/external-search
 * Proxy to Jooble API — hides the API key from the browser.
 */
router.post(
  '/external-search',
  authenticate,
  asyncHandler(async (req, res) => {
    const { keywords = '', location = '', page = 1 } = req.body;
    const data = await searchJooble({ keywords, location, page });
    res.json({ data, meta: { requestId: req.id } });
  })
);

export default router;
