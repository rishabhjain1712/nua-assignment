import axios from 'axios';

const API = axios.create({
  baseURL: 'https://nua-assignment-mrpz.onrender.com',
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
  getProfile: () => API.get('/auth/profile')
};

export const fileAPI = {
  upload: (formData) => API.post('/api/files/upload', formData),
  getMyFiles: () => API.get('/api/files/my-files'),
  getSharedFiles: () => API.get('/api/files/shared-with-me'),
  download: (id) => API.get(`/api/files/download/${id}`, { responseType: 'blob' }),
  delete: (id) => API.delete(`/api/files/${id}`)
};

export const shareAPI = {
  shareWithUser: (data) => API.post('/api/shares/user', data),
  generateLink: (data) => API.post('/api/shares/link', data),
  accessViaLink: (token) => API.get(`/api/shares/link/${token}`),
  getMyShares: () => API.get('/api/shares/my-shares'),
  revokeShare: (id) => API.delete(`/api/shares/${id}`)
};

export default API;