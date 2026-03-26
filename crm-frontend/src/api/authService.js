import API from './axios';

export const authService = {
  login: async (credentials) => {
    const response = await API.post('/auth/login/', credentials);
    return response.data;
  },

  logout: async () => {
    const response = await API.post('/auth/logout/');
    return response.data;
  },

  refreshToken: async () => {
    const response = await API.post('/auth/refresh/');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await API.get('/auth/user/');
    return response.data;
  },

  register: async (userData) => {
    const response = await API.post('/auth/register/', userData);
    return response.data;
  }
};
