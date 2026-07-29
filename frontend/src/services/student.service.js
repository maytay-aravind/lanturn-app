import { apiClient, unwrap } from '../lib/apiClient.js';

export const studentService = {
  getMe: () => apiClient.get('/students/me').then(unwrap),
  updateMe: (body) => apiClient.patch('/students/me', body).then(unwrap),
};
