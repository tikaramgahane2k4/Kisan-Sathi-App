import axios from 'axios';
import { offlineInit, isOnline, getCached, cacheResponse, enqueue, flushQueue, canQueue } from './offline';

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

// Cache GET responses
API.interceptors.response.use(async (res) => {
  try {
    if (res.config && res.config.method === 'get') {
      const key = `${res.config.baseURL}${res.config.url}${res.config.params ? '?' + new URLSearchParams(res.config.params).toString() : ''}`;
      await cacheResponse(key, res.data);
    }
  } catch {}
  return res;
});

const getKey = (url, params) => {
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  return `${base}${url}${params ? '?' + new URLSearchParams(params).toString() : ''}`;
};

const safeGet = async (url, params) => {
  await offlineInit();
  if (isOnline()) {
    const res = await API.get(url, { params });
    return res;
  } else {
    const data = await getCached(getKey(url, params));
    if (data !== undefined) return { data };
    throw new Error('Offline and no cached data available');
  }
};

const safeWrite = async (method, url, data, config) => {
  await offlineInit();
  if (isOnline()) {
    return API[method](url, data, config);
  }
  if (canQueue(method, url, data, config)) {
    const headers = (config && config.headers) || {};
    await enqueue(method.toUpperCase(), url, data, headers);
    return { data: { queued: true } };
  }
  throw new Error('Offline: cannot queue this request');
};

// Auth APIs
export const signup = (formData) => safeWrite('post', '/auth/signup', formData);
export const login = (formData) => safeWrite('post', '/auth/login', formData);
export const getMe = () => safeGet('/auth/me');

// Crop APIs
export const createCrop = (cropData) => safeWrite('post', '/crops', cropData);
export const getCrops = (status) => safeGet('/crops', { status });
export const getCrop = (id) => safeGet(`/crops/${id}`);
export const updateCrop = (id, cropData) => safeWrite('put', `/crops/${id}`, cropData);
export const completeCrop = (id, production) => safeWrite('put', `/crops/${id}/complete`, { production });
export const deleteCrop = (id) => safeWrite('delete', `/crops/${id}`);

// Material APIs
export const addMaterial = (formData) => safeWrite('post', '/materials', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const getMaterials = (cropId) => safeGet('/materials', { crop: cropId });
export const getMaterial = (id) => safeGet(`/materials/${id}`);
export const updateMaterial = (id, formData) => safeWrite('put', `/materials/${id}`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteMaterial = (id) => safeWrite('delete', `/materials/${id}`);

// Expose manual flush (used on online event)
export const flushOfflineQueue = () => flushQueue(API);

export default API;
