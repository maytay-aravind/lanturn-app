import { apiClient, unwrap } from '../lib/apiClient.js';

export const magicalService = {
  // Resume parsing (structured extraction)
  parseResume: () => apiClient.post('/magical/resume-parse').then(unwrap),
  // Resume review (quality + ATS score)
  reviewResume: () => apiClient.post('/magical/resume-review').then(unwrap),
  // Match resume against a job
  matchJob: (body) => apiClient.post('/magical/resume-match', body).then(unwrap),
  // Extract profile fields from resume for auto-fill
  extractResume: () => apiClient.post('/magical/resume-extract').then(unwrap),
};

export const joobleService = {
  search: (body) => apiClient.post('/jobs/external-search', body).then(unwrap),
};
