import API from './axios';

export const activityService = {
  getActivities: async (params = {}) => {
    const response = await API.get('/activities/', { params });
    return response.data;
  },

  getActivity: async (id) => {
    const response = await API.get(`/activities/${id}/`);
    return response.data;
  },

  createActivity: async (activityData) => {
    const response = await API.post('/activities/', activityData);
    return response.data;
  },

  updateActivity: async (id, activityData) => {
    const response = await API.put(`/activities/${id}/`, activityData);
    return response.data;
  },

  deleteActivity: async (id) => {
    const response = await API.delete(`/activities/${id}/`);
    return response.data;
  },

  getActivityStats: async () => {
    const response = await API.get('/activities/stats/');
    return response.data;
  },

  getRecentActivities: async (limit = 10) => {
    const response = await API.get('/activities/recent/', { params: { limit } });
    return response.data;
  },

  getCompanyActivities: async (companyId, params = {}) => {
    const response = await API.get(`/activities/`, { 
      params: { ...params, model_name: 'Company', object_id: companyId }
    });
    return response.data;
  }
};
