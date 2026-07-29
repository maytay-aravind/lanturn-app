import { apiClient, unwrap } from '../lib/apiClient.js';

export const jobService = {
  list: (params) => apiClient.get('/jobs', { params }).then(unwrap),
  get: (jobId) => apiClient.get(`/jobs/${jobId}`).then(unwrap),
  create: (body) => apiClient.post('/jobs', body).then(unwrap),
  update: (jobId, body) => apiClient.patch(`/jobs/${jobId}`, body).then(unwrap),
  remove: (jobId) => apiClient.delete(`/jobs/${jobId}`).then(unwrap),
  listMine: (params) => apiClient.get('/jobs/me/all', { params }).then(unwrap),
};
