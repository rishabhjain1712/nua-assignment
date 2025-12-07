import axios from 'axios';

const API = axios.create({
  baseURL: 'https://nua-assignment-mrpz.onrender.com',
   headers: {
    'Content-Type': 'application/json'
  }
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
  upload: (formData) => API.post('/files/upload', formData),
  getMyFiles: () => API.get('/files/my-files'),
  getSharedFiles: () => API.get('/files/shared-with-me'),
  download: (id) => API.get(`/files/download/${id}`, { responseType: 'blob' }),
  delete: (id) => API.delete(`/files/${id}`)
};

export const shareAPI = {
  shareWithUser: (data) => API.post('/shares/user', data),
  generateLink: (data) => API.post('/shares/link', data),
  accessViaLink: (token) => API.get(`/shares/link/${token}`),
  getMyShares: () => API.get('/shares/my-shares'),
  revokeShare: (id) => API.delete(`/shares/${id}`)
};

export default API;