import { apiClient, unwrap } from '../lib/apiClient.js';

export const studentService = {
  getMe: () => apiClient.get('/students/me').then(unwrap),
  updateMe: (body) => apiClient.patch('/students/me', body).then(unwrap),
  getResumeUrl: () => apiClient.get('/students/me/resume-url').then(unwrap),
  getCertificateUrl: (path) => apiClient.get('/students/me/certificate-url', { params: { path } }).then(unwrap),
  // Public profile (for employer viewing applicant)
  getPublic: (uid) => apiClient.get(`/students/${uid}`).then(unwrap),
};
