import { env } from '#config';
import { logger_for } from '#utils/logger.js';

const log = logger_for('jooble.client');

/**
 * Search Jooble for jobs.
 * @param {{ keywords: string, location?: string, page?: number, limit?: number }} params
 */
export async function searchJooble({ keywords, location = '', page = 1, limit = 20 }) {
  if (!env.JOOBLE_API_KEY) {
    throw new Error('Jooble API key not configured');
  }

  const url = `https://jooble.org/api/${env.JOOBLE_API_KEY}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      keywords,
      location,
      page: String(page),
      ResultOnPage: String(Math.min(limit, 20)),
    }),
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    const text = await res.text();
    log.error({ status: res.status, body: text }, 'Jooble API error');
    throw new Error(`Jooble error ${res.status}`);
  }

  const data = await res.json();
  // Jooble response: { totalCount: number, jobs: [...] }
  return {
    totalCount: data.totalCount || 0,
    jobs: (data.jobs || []).map((j) => ({
      id: j.id,
      title: j.title,
      company: j.company,
      location: j.location,
      salary: j.salary,
      type: j.type,
      link: j.link,
      snippet: j.snippet,
      updated: j.updated,
    })),
  };
}
