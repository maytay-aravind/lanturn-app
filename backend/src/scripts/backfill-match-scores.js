import { supabase } from '../supabase/index.js';
import { candidateMatchingService } from '../services/candidateMatching.service.js';
import { logger_for } from '../utils/logger.js';

const log = logger_for('script.backfill');

async function run() {
  log.info('Fetching applications...');
  const { data: apps, error } = await supabase.from('applications').select('student_id, job_id');
  if (error) {
    log.error({ error }, 'Failed to fetch applications');
    process.exit(1);
  }

  log.info(`Found ${apps.length} applications.`);

  for (const app of apps) {
    try {
      log.info(`Processing student ${app.student_id} for job ${app.job_id}...`);
      await candidateMatchingService.generateAndStoreMatchScore(app.student_id, app.job_id);
      log.info(`Success for ${app.student_id}`);
    } catch (err) {
      log.error({ err }, `Failed for ${app.student_id}`);
    }
  }

  log.info('Done.');
  process.exit(0);
}

run();
