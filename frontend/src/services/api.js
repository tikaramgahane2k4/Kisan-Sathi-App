import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://khetbookapp.vercel.app/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const auth = localStorage.getItem('agri_auth');
    if (auth) {
      const { token } = JSON.parse(auth);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('agri_auth');
      window.location.href = '/#/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  googleLogin: async (payload) => {
    const response = await api.post('/auth/google', payload);
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },
};

// Crop APIs
export const cropAPI = {
  getCrops: async () => {
    const response = await api.get('/crops');
    return response.data;
  },

  getCropById: async (id) => {
    const response = await api.get(`/crops/${id}`);
    return response.data;
  },

  createCrop: async (cropData) => {
    const response = await api.post('/crops', cropData);
    return response.data;
  },

  updateCrop: async (id, cropData) => {
    const response = await api.put(`/crops/${id}`, cropData);
    return response.data;
  },

  deleteCrop: async (id) => {
    const response = await api.delete(`/crops/${id}`);
    return response.data;
  },

  addSale: async (id, saleData) => {
    const response = await api.post(`/crops/${id}/sales`, saleData);
    return response.data;
  },
};

// Expense APIs
export const expenseAPI = {
  addExpense: async (cropId, expenseData) => {
    const response = await api.post(`/expenses/${cropId}`, expenseData);
    return response.data;
  },

  updateExpense: async (cropId, expenseId, expenseData) => {
    const response = await api.put(`/expenses/${cropId}/${expenseId}`, expenseData);
    return response.data;
  },

  deleteExpense: async (cropId, expenseId) => {
    const response = await api.delete(`/expenses/${cropId}/${expenseId}`);
    return response.data;
  },
};

export default api;
