import API from './axios';

export const contactService = {
  getContacts: async (companyId, params = {}) => {
    const response = await API.get(`/contacts/`, { params: { ...params, company: companyId } });
    return response.data;
  },

  searchContacts: async (searchParams = {}) => {
    const response = await API.get(`/contacts/`, { params: searchParams });
    return response.data;
  },

  getContact: async (companyId, contactId) => {
    const response = await API.get(`/contacts/${contactId}/`);
    return response.data;
  },

  createContact: async (companyId, contactData) => {
    const response = await API.post(`/contacts/`, { ...contactData, company: companyId });
    return response.data;
  },

  updateContact: async (companyId, contactId, contactData) => {
    const response = await API.put(`/contacts/${contactId}/`, contactData);
    return response.data;
  },

  deleteContact: async (companyId, contactId) => {
    const response = await API.delete(`/contacts/${contactId}/`);
    return response.data;
  }
};
