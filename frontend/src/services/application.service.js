import { apiClient, unwrap } from '../lib/apiClient.js';

export const applicationService = {
  apply: (jobId) => apiClient.post(`/jobs/${jobId}/applications`).then(unwrap),
  listMine: (params) => apiClient.get('/applications', { params }).then(unwrap),
  get: (applicationId) => apiClient.get(`/applications/${applicationId}`).then(unwrap),
  withdraw: (applicationId) => apiClient.delete(`/applications/${applicationId}`).then(unwrap),
  listForJob: (jobId, params) => apiClient.get(`/jobs/${jobId}/applications`, { params }).then(unwrap),
  updateStatus: (applicationId, body) => apiClient.patch(`/applications/${applicationId}/status`, body).then(unwrap),
};
