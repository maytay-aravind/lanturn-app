import { apiClient, unwrap } from '../lib/apiClient.js';

export const employerService = {
  getMe: () => apiClient.get('/employers/me').then(unwrap),
  updateMe: (body) => apiClient.patch('/employers/me', body).then(unwrap),
  getAnalytics: () => apiClient.get('/employers/me/analytics').then(unwrap),
  getPublic: (uid) => apiClient.get(`/employers/${uid}`).then(unwrap),
  getJobMatches: (jobId) => apiClient.get(`/employers/jobs/${jobId}/matches`).then(unwrap),
  getTopRecommendations: () => apiClient.get('/employers/me/recommendations').then(unwrap),

  // AI Hiring Assistant
  aiChat: (body) => apiClient.post('/employers/ai/chat', body).then(unwrap),
  aiListThreads: () => apiClient.get('/employers/ai/threads').then(unwrap),
  aiGetMessages: (threadId) => apiClient.get(`/employers/ai/threads/${threadId}/messages`).then(unwrap),
  aiDeleteThread: (threadId) => apiClient.delete(`/employers/ai/threads/${threadId}`).then(unwrap),

  // AI Job Description Generator
  aiGenerateJobDesc: (body) => apiClient.post('/employers/ai/generate-job-description', body).then(unwrap),

  // Company DNA
  generateCompanyDna: () => apiClient.post('/employers/company-dna/generate').then(unwrap),
  getCompanyDna: () => apiClient.get('/employers/me/company-dna').then(unwrap),
  getPublicCompanyDna: (uid) => apiClient.get(`/employers/${uid}/company-dna`).then(unwrap),

  getTopCompanies: (limit = 10) => apiClient.get('/employers/top-companies', { params: { limit } }).then(unwrap),
};
