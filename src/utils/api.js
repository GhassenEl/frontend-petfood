import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { clearAuthToken, getStoredToken } from './authStorage';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

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
  const token = getStoredToken();
  // Validate token before attaching
  if (token && isValidToken(token)) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (token) {
    // Clear invalid token
    clearAuthToken();
    console.warn('Cleared invalid token');
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      const msg = 'Backend injoignable. Démarrez le backend (dossier backend) et vérifiez que le proxy Vite pointe vers le même port que PORT dans backend/.env (ex. http://127.0.0.1:5002).';
      console.error(msg, error);
      error.isBackendOffline = true;
      error.backendErrorMessage = msg;
    } else if (error.response?.status === 502 || error.response?.status === 503) {
      const msg =
        'Passerelle API (502/503) : le proxy Vite ne joint pas le backend. Vérifiez VITE_API_PROXY_TARGET ou le PORT dans backend/.env, puis relancez npm run dev.';
      console.error(msg, error.config?.url);
      error.isBadGateway = true;
      error.backendErrorMessage = msg;
    } else if (error.response?.status === 404) {
      console.error(`API 404: ${error.config?.url} not found.`);
      error.isNotFound = true;
    } else if (error.response?.status === 403 && error.response?.data?.error === 'Account disabled') {
      console.warn('Account disabled — redirecting to login');
      clearAuthToken();
      delete api.defaults.headers.common['Authorization'];
      if (!window.location.pathname.includes('/login')) {
        window.location.assign('/login');
      }
    } else if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      // Avoid redirect loop on login/register calls
      if (!requestUrl.includes('/auth/login') && !requestUrl.includes('/auth/register')) {
        if (!window.location.pathname.includes('/login')) {
          console.warn('Unauthorized (401). Redirecting to login');
          clearAuthToken();
          delete api.defaults.headers.common['Authorization'];
          window.location.assign('/login');
        } else {
          // Already on login page: just clear token
          clearAuthToken();
          delete api.defaults.headers.common['Authorization'];
        }
      } else {
        // login/register failed -> clear stale token if any
        clearAuthToken();
        delete api.defaults.headers.common['Authorization'];
      }
    }
    return Promise.reject(error);
  }
);


export default api;
