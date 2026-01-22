import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
});

// Add token to requests
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Auth APIs
export const signup = (formData) => API.post('/auth/signup', formData);
export const login = (formData) => API.post('/auth/login', formData);
export const getMe = () => API.get('/auth/me');

// Crop APIs
export const createCrop = (cropData) => API.post('/crops', cropData);
export const getCrops = (status) => API.get('/crops', { params: { status } });
export const getCrop = (id) => API.get(`/crops/${id}`);
export const updateCrop = (id, cropData) => API.put(`/crops/${id}`, cropData);
export const completeCrop = (id, production) => API.put(`/crops/${id}/complete`, { production });
export const deleteCrop = (id) => API.delete(`/crops/${id}`);

// Material APIs
export const addMaterial = (formData) => API.post('/materials', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const getMaterials = (cropId) => API.get('/materials', { params: { crop: cropId } });
export const getMaterial = (id) => API.get(`/materials/${id}`);
export const updateMaterial = (id, formData) => API.put(`/materials/${id}`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteMaterial = (id) => API.delete(`/materials/${id}`);

export default API;
