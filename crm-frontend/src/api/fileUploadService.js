import API from './axios';

export const fileUploadService = {
  uploadFile: async (file, folder = 'logos') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await API.post('/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteFile: async (fileUrl) => {
    const response = await API.delete('/upload/', { data: { file_url: fileUrl } });
    return response.data;
  }
};
