import { env } from '#config';
import { AppError } from '#utils/httpErrors.js';
import { logger_for } from '#utils/logger.js';

const log = logger_for('magical.client');

// MagicalAPI gateway — note this is `gw.` not `api.`.
const BASE = 'https://gw.magicalapi.com';
const API_VERSION = '1';
const MAX_POLLS = 15; // ~30s of polling before giving up on a 201-pending job
const POLL_DELAY_MS = 2000;

/**
 * Low-level POST to MagicalAPI.
 *
 * MagicalAPI uses an async 201/200 pattern: the first request (and any
 * follow-up while the job is still processing) returns HTTP 201 with a
 * `data.request_id`. We re-send the SAME payload with `request_id` appended
 * until the server returns HTTP 200 with the final result.
 *
 * Auth is via the `api-key` header (not `x-api-key`), and a `version` header
 * is required. All requests are JSON — file uploads are not supported.
 */
async function post(path, payload) {
  if (!env.MAGICAL_API_KEY) {
    throw new Error('MagicalAPI key not configured (MAGICAL_API_KEY)');
  }

  const headers = {
    'api-key': env.MAGICAL_API_KEY,
    'version': API_VERSION,
    'Content-Type': 'application/json',
  };

  const body = { ...payload };
  let response = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30000),
  });

  let json = await safeJson(response);

  // Poll while the job is pending (HTTP 201 carries a request_id).
  let polls = 0;
  while (response.status === 201 && polls < MAX_POLLS) {
    const requestId = json?.data?.request_id;
    if (!requestId) break; // malformed — bail and let the error path handle it
    log.debug({ path, requestId, poll: polls + 1 }, 'MagicalAPI job pending, re-polling');
    await sleep(POLL_DELAY_MS);

    body.request_id = requestId;
    response = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000),
    });
    json = await safeJson(response);
    polls++;
  }

  if (!response.ok) {
    const text = JSON.stringify(json);
    log.error({ status: response.status, body: text, path }, 'MagicalAPI error');
    // Surface the API's own message when present
    const message = json?.message || json?.error || text || `HTTP ${response.status}`;
    throw AppError.upstream(`MagicalAPI error ${response.status}: ${message}`);
  }

  if (response.status === 202 || response.status === 201) {
    throw AppError.upstream('MagicalAPI job did not complete in time — please try again');
  }

  return json;
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Parse a resume from a publicly-accessible (or signed) URL.
 * @param {string} resumeUrl - Accessible HTTPS URL of the resume PDF
 * @returns {Promise<object>} MagicalAPI response (contains `data` + `usage`)
 */
export async function parseResume(resumeUrl) {
  return post('/resume-parser', { url: resumeUrl });
}

/**
 * Review a resume for quality / ATS score / feedback.
 * @param {string} resumeUrl - Accessible HTTPS URL of the resume
 */
export async function reviewResume(resumeUrl) {
  return post('/resume-review', { url: resumeUrl });
}

/**
 * Score how well a resume matches a job description.
 * @param {string} resumeUrl - Accessible HTTPS URL of the resume
 * @param {string} jobDescription - Full text of the job description (100–5000 chars)
 */
export async function matchResume(resumeUrl, jobDescription) {
  return post('/resume-score', { url: resumeUrl, job_description: jobDescription });
}
