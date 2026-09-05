import apiClient from './client';

export const orgApi = {
  create: (data) => apiClient.post('/api/organizations', data),
  join: (inviteCode) => apiClient.post('/api/organizations/join', { inviteCode }),
  requestLeave: () => apiClient.post('/api/organizations/leave-requests'),
  getLeaveRequests: () => apiClient.get('/api/organizations/leave-requests'),
  reviewLeaveRequest: (requestId, decision) =>
    apiClient.patch(`/api/organizations/leave-requests/${requestId}`, { decision }),
  getMe: () => apiClient.get('/api/organizations/me'),
  update: (data) => apiClient.patch('/api/organizations/me', data),
  getMembers: () => apiClient.get('/api/organizations/members'),
};
