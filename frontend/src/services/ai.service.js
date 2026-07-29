import { apiClient, unwrap } from '../lib/apiClient.js';

export const aiService = {
  // Resume analysis
  reviewResume: (body) => apiClient.post('/ai/resume-review', body).then(unwrap),
  matchJob: (body) => apiClient.post('/ai/resume-match', body).then(unwrap),
  skillGap: (body) => apiClient.post('/ai/skill-gap', body).then(unwrap),
  interviewQuestions: (body) => apiClient.post('/ai/interview-questions', body).then(unwrap),
  coverLetter: (body) => apiClient.post('/ai/cover-letter', body).then(unwrap),

  // Career chat
  careerChat: (body) => apiClient.post('/ai/career-chat', body).then(unwrap),
  listThreads: () => apiClient.get('/ai/threads').then(unwrap),
  getThreadMessages: (threadId) => apiClient.get(`/ai/threads/${threadId}/messages`).then(unwrap),
};