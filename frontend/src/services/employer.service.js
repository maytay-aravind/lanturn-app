import { apiClient, unwrap } from '../lib/apiClient.js';

export const employerService = {
  getMe: () => apiClient.get('/employers/me').then(unwrap),
  updateMe: (body) => apiClient.patch('/employers/me', body).then(unwrap),
};
