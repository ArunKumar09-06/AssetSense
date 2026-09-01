import apiClient from './client';

export const teamApi = {
  getAll: () => apiClient.get('/api/teams'),
  getById: (teamId) => apiClient.get(`/api/teams/${teamId}`),
  create: (data) => apiClient.post('/api/teams', data),
  update: (teamId, data) => apiClient.patch(`/api/teams/${teamId}`, data),
  delete: (teamId) => apiClient.delete(`/api/teams/${teamId}`),

  // Team Member Management
  getMembers: (teamId) => apiClient.get(`/api/teammembers/${teamId}/members`),
  addMember: (teamId, userId) =>
    apiClient.post(`/api/teammembers/${teamId}/members/${userId}`),
  removeMember: (teamId, userId) =>
    apiClient.delete(`/api/teammembers/${teamId}/members/${userId}`),
};
