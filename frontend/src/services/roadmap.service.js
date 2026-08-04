import { apiClient, unwrap } from '../lib/apiClient.js';

export const roadmapService = {
  /** List all available career domains */
  listDomains: () => apiClient.get('/roadmaps/domains').then(unwrap),

  /** Get full domain detail (static data from backend) */
  getDomain: (domainId) => apiClient.get(`/roadmaps/domains/${domainId}`).then(unwrap),

  /** Get the student's enrolled roadmaps with progress */
  getMyRoadmaps: () => apiClient.get('/roadmaps/me').then(unwrap),

  /** Enroll in a career domain */
  enroll: (domainId) => apiClient.post('/roadmaps/me/enroll', { domainId }).then(unwrap),

  /** Remove a roadmap enrollment */
  remove: (roadmapId) => apiClient.delete(`/roadmaps/me/${roadmapId}`).then(unwrap),

  /** Toggle a topic's completion */
  toggleTopic: (roadmapId, stageIndex, topicIndex, completed) =>
    apiClient
      .patch(`/roadmaps/me/${roadmapId}/progress`, { stageIndex, topicIndex, completed })
      .then(unwrap),
};
