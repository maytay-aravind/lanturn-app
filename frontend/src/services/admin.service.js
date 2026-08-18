import { apiClient, unwrap } from '../lib/apiClient.js';

export const adminService = {
  // ── Users ──────────────────────────────────────────────────────────────
  listUsers: (params) =>
    apiClient.get('/admin/users', { params }).then(unwrap),

  updateUserStatus: (uid, status) =>
    apiClient.patch(`/admin/users/${uid}/status`, { status }).then(unwrap),

  updateUserRole: (uid, role) =>
    apiClient.patch(`/admin/users/${uid}/role`, { role }).then(unwrap),

  // ── Jobs ───────────────────────────────────────────────────────────────
  listJobs: () =>
    apiClient.get('/admin/jobs').then(unwrap),

  moderateJob: (jobId, status) =>
    apiClient.patch(`/admin/jobs/${jobId}/status`, { status }).then(unwrap),

  verifyJob: (jobId) =>
    apiClient.patch(`/admin/jobs/${jobId}/verify`).then(unwrap),

  // ── Analytics ──────────────────────────────────────────────────────────
  getAnalyticsSummary: () =>
    apiClient.get('/admin/analytics/summary').then(unwrap),

  getAnalyticsSeries: (params) =>
    apiClient.get('/admin/analytics/series', { params }).then(unwrap),

  // ── Platform Config ────────────────────────────────────────────────────
  getPlatformConfig: () =>
    apiClient.get('/platform/config').then(unwrap),

  updatePlatformConfig: (body) =>
    apiClient.patch('/platform/config', body).then(unwrap),

  // ── Admin Login ────────────────────────────────────────────────────────
  adminLogin: () =>
    apiClient.post('/auth/admin-login').then(unwrap),
};
