import { apiClient, unwrap } from '../lib/apiClient.js';

export const employerService = {
  getMe: () => apiClient.get('/employers/me').then(unwrap),
  updateMe: (body) => apiClient.patch('/employers/me', body).then(unwrap),
  getAnalytics: () => apiClient.get('/employers/me/analytics').then(unwrap),
  getPublic: (uid) => apiClient.get(`/employers/${uid}`).then(unwrap),
};
