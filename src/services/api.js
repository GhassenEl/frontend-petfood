import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

// Ensure any defaults Authorization is cleared if token is missing/invalid
api.defaults.headers.common = api.defaults.headers.common || {};


// Safe token validation helper
const isValidToken = (token) => {
  if (!token) return false;
  try {
    const decoded = jwtDecode(token);
    // Check if token is expired
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  // Validate token before attaching
  if (token && isValidToken(token)) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (token) {
    // Clear invalid token
    localStorage.removeItem('token');
    console.warn('Cleared invalid token');
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      const msg = 'Backend unreachable (network error). Vérifie backend sur http://localhost:5001';
      console.error(msg, error);
      error.isBackendOffline = true;
      error.backendErrorMessage = msg;
    } else if (error.response?.status === 404) {
      console.error(`API 404: ${error.config?.url} not found.`);
      error.isNotFound = true;
    } else if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      // Only redirect on auth errors (not on login/register to avoid loop)
      if (!requestUrl.includes('/auth/login') && !requestUrl.includes('/auth/register')) {
        // Check if not already on login page
        if (!window.location.pathname.includes('/login')) {
          console.warn('Session expired, redirecting to login');
          localStorage.removeItem('token');
          // Keep current origin, only route to /login
          window.location.assign('/login');
        }
      }

    }
    return Promise.reject(error);
  }
);

export default api;
