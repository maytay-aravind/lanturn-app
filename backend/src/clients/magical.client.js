import { env } from '#config';
import { logger_for } from '#utils/logger.js';

const log = logger_for('magical.client');
const BASE = 'https://api.magicalapi.com';

/** JSON-body call (for review + score endpoints that accept a URL) */
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
    throw new Error(`MagicalAPI error ${res.status}: ${text}`);
  }

  return res.json();
}

/**
 * Parse a resume by sending PDF bytes as multipart/form-data.
 * This avoids passing a signed URL to an external server — instead our backend
 * downloads the bytes from Supabase storage and forwards them directly.
 *
 * @param {Buffer|Uint8Array} pdfBytes - Raw PDF file bytes
 * @param {string} filename - Filename hint (e.g. "resume.pdf")
 */
export async function parseResumeBytes(pdfBytes, filename = 'resume.pdf') {
  if (!env.MAGICAL_API_KEY) {
    throw new Error('MagicalAPI key not configured');
  }

  const form = new FormData();
  form.append('file', new Blob([pdfBytes], { type: 'application/pdf' }), filename);

  const res = await fetch(`${BASE}/resume/parser`, {
    method: 'POST',
    headers: {
      'x-api-key': env.MAGICAL_API_KEY,
      // Do NOT set Content-Type manually — fetch sets it with the correct boundary for FormData
    },
    body: form,
    signal: AbortSignal.timeout(45000),
  });

  if (!res.ok) {
    const text = await res.text();
    log.error({ status: res.status, body: text }, 'MagicalAPI parseResumeBytes error');
    throw new Error(`MagicalAPI error ${res.status}: ${text}`);
  }

  return res.json();
}

/**
 * Parse a resume from a publicly accessible URL.
 * Only use when the URL is truly public. Prefer parseResumeBytes for private buckets.
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
