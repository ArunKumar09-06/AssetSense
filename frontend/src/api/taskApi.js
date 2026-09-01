import apiClient from './client';

export const taskApi = {
  create: (projectId, data) => apiClient.post(`/api/projects/${projectId}/tasks`, data),
  getByProject: (projectId) => apiClient.get(`/api/projects/${projectId}/tasks`),
  getMyTasks: () => apiClient.get('/api/tasks/my'),
  getById: (taskId) => apiClient.get(`/api/tasks/${taskId}`),
  update: (taskId, data) => apiClient.patch(`/api/tasks/${taskId}`, data),
  updateStatus: (taskId, status) => apiClient.patch(`/api/tasks/${taskId}/status`, { status }),
  assign: (taskId, assignedTo) => apiClient.patch(`/api/tasks/${taskId}/assign`, { assignedTo }),
  delete: (taskId) => apiClient.delete(`/api/tasks/${taskId}`),
};
