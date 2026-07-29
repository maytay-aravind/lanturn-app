import { randomBytes } from 'node:crypto';

// Generate a short, URL-safe id with a prefix (e.g. "job_a1b2c3").
export function generateId(prefix = '') {
  const id = randomBytes(9).toString('base64url').slice(0, 12);
  return prefix ? `${prefix}_${id}` : id;
}

// Stable id used to enforce uniqueness of an application per (student, job).
export function applicationIdFor(studentId, jobId) {
  return `${studentId}_${jobId}`;
}
