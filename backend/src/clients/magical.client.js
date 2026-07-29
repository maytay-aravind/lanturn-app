import { env } from '#config';
import { logger_for } from '#utils/logger.js';

const log = logger_for('magical.client');
const BASE = 'https://api.magicalapi.com';

async function callMagical(path, body) {
  if (!env.MAGICAL_API_KEY) {
    throw new Error('MagicalAPI key not configured');
  }

  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': env.MAGICAL_API_KEY,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) {
    const text = await res.text();
    log.error({ status: res.status, body: text }, 'MagicalAPI error');
    throw new Error(`MagicalAPI error ${res.status}`);
  }

  return res.json();
}

/**
 * Parse a resume from a URL and return structured JSON.
 * @param {string} resumeUrl - Publicly accessible URL of the resume PDF
 */
export async function parseResume(resumeUrl) {
  return callMagical('/resume/parser', { url: resumeUrl });
}

/**
 * Review a resume for quality, ATS score, and feedback.
 * @param {string} resumeUrl - URL of the resume
 */
export async function reviewResume(resumeUrl) {
  return callMagical('/resume/checker', { url: resumeUrl });
}

/**
 * Match a resume against a job description.
 * @param {string} resumeUrl - URL of the resume
 * @param {string} jobDescription - Text of the job description
 */
export async function matchResume(resumeUrl, jobDescription) {
  return callMagical('/resume/score', {
    url: resumeUrl,
    job_description: jobDescription,
  });
}
