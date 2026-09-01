import apiClient from './client';

export const authApi = {
  register: (data) => apiClient.post('/api/auth/register', data),
  login: (credentials) => apiClient.post('/api/auth/login', credentials),
  logout: () => apiClient.post('/api/auth/logout'),
  getCurrentUser: () => apiClient.get('/api/auth/me'),
  updateProfilePicture: (formData) =>
    apiClient.patch('/api/auth/profile-picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};
