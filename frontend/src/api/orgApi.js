import apiClient from './client';

export const orgApi = {
  create: (data) => apiClient.post('/api/organizations', data),
  getMe: () => apiClient.get('/api/organizations/me'),
  update: (data) => apiClient.patch('/api/organizations/me', data),
  getMembers: () => apiClient.get('/api/organizations/members'),
};
