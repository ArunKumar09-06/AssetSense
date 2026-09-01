import apiClient from './client';

export const projectApi = {
  getAll: () => apiClient.get('/api/projects'),
  getById: (projectId) => apiClient.get(`/api/projects/${projectId}`),
  create: (data) => apiClient.post('/api/projects', data),
  update: (projectId, data) => apiClient.patch(`/api/projects/${projectId}`, data),
  
  // Team attachments for projects
  getAttachedTeams: (projectId) => apiClient.get(`/api/teamprojects/${projectId}/teams`),
  attachTeam: (projectId, teamId) =>
    apiClient.post(`/api/teamprojects/${projectId}/teams/${teamId}`),
  detachTeam: (projectId, teamId) =>
    apiClient.delete(`/api/teamprojects/${projectId}/teams/${teamId}`),
};
