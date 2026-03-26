import API from './axios';

export const companyService = {
  getCompanies: async (params = {}) => {
    const response = await API.get('/companies/', { params });
    return response.data;
  },

  getCompany: async (id) => {
    const response = await API.get(`/companies/${id}/`);
    return response.data;
  },

  createCompany: async (companyData) => {
    const response = await API.post('/companies/', companyData);
    return response.data;
  },

  updateCompany: async (id, companyData) => {
    const response = await API.put(`/companies/${id}/`, companyData);
    return response.data;
  },

  deleteCompany: async (id) => {
    const response = await API.delete(`/companies/${id}/`);
    return response.data;
  },

  uploadCompanyDocument: async (companyId, formData) => {
    const response = await API.post(`/companies/${companyId}/upload/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  uploadCompanyLogo: async (companyId, formData) => {
    const response = await API.post(`/companies/${companyId}/logo/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};
