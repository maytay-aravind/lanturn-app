import { Router } from 'express';
import { supabase } from '#supabase';

const router = Router();

// Liveness (no dependencies)
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Readiness (Supabase reachable)
router.get('/health/ready', async (_req, res) => {
  try {
    const { error } = await supabase.from('users').select('uid').limit(1);
    if (error) throw error;
    res.json({ status: 'ready', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ status: 'not_ready', error: err.message });
  }
});

// Version
router.get('/version', (_req, res) => {
  res.json({ name: 'lanturn-backend', version: '0.1.0' });
});

export default router;

