import axios from 'axios';
import {
  clearAuthToken,
  getStoredToken,
  isRememberMeEnabled,
  persistAuthToken,
} from './authStorage';
import {
  AUTH_EVENTS,
  emitAuthLogout,
  emitTokenRefreshed,
  isValidToken,
  shouldRefreshToken,
  validateTokenClaims,
} from './jwtSecurity';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

api.defaults.headers.common = api.defaults.headers.common || {};

let refreshPromise = null;

const getCsrfToken = () => {
  if (typeof document === 'undefined') return null;
  const meta = document.querySelector('meta[name="csrf-token"]');
  if (meta?.content) return meta.content.trim();
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
};

const attachBearer = (config, token) => {
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
};

const refreshAccessToken = async () => {
  const currentToken = getStoredToken();
  if (!currentToken || !shouldRefreshToken(currentToken)) {
    return currentToken;
  }

  if (!refreshPromise) {
    refreshPromise = api
      .post('/auth/refresh', {}, {
        headers: { Authorization: `Bearer ${currentToken}` },
        _skipAuthRefresh: true,
      })
      .then((response) => {
        const newToken = response.data?.token;
        const validation = validateTokenClaims(newToken);
        if (!validation.valid) {
          throw new Error(validation.reason || 'invalid_refresh_token');
        }
        persistAuthToken(newToken, isRememberMeEnabled());
        emitTokenRefreshed(newToken);
        return newToken;
      })
      .catch((error) => {
        if (error.response?.status !== 404) {
          emitAuthLogout('refresh_failed');
        }
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

const resolveRequestToken = async (config) => {
  if (config._skipAuthRefresh) {
    return getStoredToken();
  }

  let token = getStoredToken();
  if (token && shouldRefreshToken(token)) {
    token = await refreshAccessToken();
  }
  return token;
};

api.interceptors.request.use(async (config) => {
  config.headers = config.headers || {};
  config.headers['X-Client-Platform'] = 'petfoodtn-web';
  config.headers['X-Requested-With'] = 'XMLHttpRequest';

  const method = (config.method || 'get').toLowerCase();
  if (['post', 'put', 'patch', 'delete'].includes(method)) {
    const csrf = getCsrfToken();
    if (csrf) config.headers['X-CSRF-Token'] = csrf;
  }

  const token = await resolveRequestToken(config);

  if (token && isValidToken(token)) {
    return attachBearer(config, token);
  }

  if (token) {
    clearAuthToken();
    emitAuthLogout('invalid_token');
    console.warn('JWT invalide ou expiré — session effacée');
  }

  return attachBearer(config, null);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      const msg =
        'Backend injoignable. Démarrez le backend (dossier backend) et vérifiez que le proxy Vite pointe vers le même port que PORT dans backend/.env (ex. http://127.0.0.1:5002).';
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
      console.warn('Compte désactivé — redirection vers login');
      clearAuthToken();
      delete api.defaults.headers.common.Authorization;
      emitAuthLogout('account_disabled');
      if (!window.location.pathname.includes('/login')) {
        window.location.assign('/login');
      }
    } else if (error.response?.status === 401) {
      if (error.config?._publicMarketing) {
        return Promise.reject(error);
      }
      const requestUrl = error.config?.url || '';
      if (!requestUrl.includes('/auth/login') && !requestUrl.includes('/auth/register')) {
        if (!window.location.pathname.includes('/login')) {
          console.warn('Non autorisé (401) — redirection vers login');
          clearAuthToken();
          delete api.defaults.headers.common.Authorization;
          emitAuthLogout('unauthorized');
          window.location.assign('/login');
        } else {
          clearAuthToken();
          delete api.defaults.headers.common.Authorization;
        }
      } else {
        clearAuthToken();
        delete api.defaults.headers.common.Authorization;
      }
    }
    return Promise.reject(error);
  }
);

export { AUTH_EVENTS };
export default api;
