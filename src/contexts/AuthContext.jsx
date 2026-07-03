import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { AUTH_EVENTS } from '../utils/api';
import {
  clearAuthToken,
  getStoredToken,
  persistAuthToken,
} from '../utils/authStorage';
import { mapAuthError } from '../utils/authErrors';
import { tryDemoLogin } from '../utils/demoAuth';
import { getDemoAccountByEmail } from '../config/demoAccounts';
import {
  emitSessionExpiring,
  isTokenExpired,
  isValidToken,
  userFromToken,
  validateTokenClaims,
} from '../utils/jwtSecurity';
import { useHttpOnlyAuthCookie } from '../config/authPolicy';

const SESSION_CHECK_MS = 30_000;
const SESSION_WARNING_MS = 5 * 60 * 1000;

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const applySession = useCallback((nextToken, apiUser = null) => {
    if (!nextToken) {
      setToken(null);
      setUser(null);
      delete api.defaults.headers.common.Authorization;
      return { ok: false };
    }

    const validation = validateTokenClaims(nextToken);
    if (!validation.valid) {
      clearAuthToken();
      setToken(null);
      setUser(null);
      delete api.defaults.headers.common.Authorization;
      return { ok: false, reason: validation.reason };
    }

    const sessionUser = userFromToken(validation.decoded, apiUser);
    setToken(nextToken);
    setUser(sessionUser);
    api.defaults.headers.common.Authorization = `Bearer ${nextToken}`;
    return { ok: true, user: sessionUser };
  }, []);

  const logout = useCallback(async () => {
    const storedToken = getStoredToken();
    if (storedToken) {
      try {
        await api.post('/auth/logout', {}, { _skipAuthRefresh: true });
      } catch {
        // Ignore — local logout still required
      }
    }
    clearAuthToken();
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common.Authorization;
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const cookieMode = useHttpOnlyAuthCookie();
        const storedToken = getStoredToken();

        if (cookieMode && !storedToken) {
          try {
            const meRes = await api.get('/auth/me', { _skipAuthRefresh: true });
            if (meRes.data?.user) {
              setUser(meRes.data.user);
              setToken('cookie');
            }
          } catch {
            /* pas de session cookie */
          }
          return;
        }

        if (storedToken) {
          const result = applySession(storedToken);
          if (result.ok) {
            try {
              const meRes = await api.get('/auth/me', { _skipAuthRefresh: false });
              if (meRes.data?.user) {
                applySession(storedToken, meRes.data.user);
              }
            } catch {
              /* token local suffit si /auth/me indisponible */
            }
          } else {
            console.warn('Session JWT invalide au démarrage:', result.reason);
          }
        }
      } catch (error) {
        console.error('Erreur initialisation auth:', error);
        setAuthError(error.message);
        clearAuthToken();
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [applySession]);

  useEffect(() => {
    const onLogout = () => {
      clearAuthToken();
      setToken(null);
      setUser(null);
      delete api.defaults.headers.common.Authorization;
    };

    const onTokenRefreshed = (event) => {
      const nextToken = event.detail?.token;
      if (nextToken) {
        applySession(nextToken, user);
      }
    };

    window.addEventListener(AUTH_EVENTS.LOGOUT, onLogout);
    window.addEventListener(AUTH_EVENTS.TOKEN_REFRESHED, onTokenRefreshed);
    return () => {
      window.removeEventListener(AUTH_EVENTS.LOGOUT, onLogout);
      window.removeEventListener(AUTH_EVENTS.TOKEN_REFRESHED, onTokenRefreshed);
    };
  }, [applySession, user]);

  useEffect(() => {
    if (!token || token === 'cookie') {
      if (token === 'cookie' && useHttpOnlyAuthCookie()) {
        const intervalId = window.setInterval(async () => {
          try {
            await api.get('/auth/me', { _skipAuthRefresh: true });
          } catch {
            logout();
            if (!window.location.pathname.includes('/login')) {
              window.location.assign('/login');
            }
          }
        }, SESSION_CHECK_MS);
        return () => window.clearInterval(intervalId);
      }
      return undefined;
    }

    let warned = false;

    const checkSession = () => {
      const storedToken = getStoredToken();
      if (!storedToken || !isValidToken(storedToken)) {
        logout();
        if (!window.location.pathname.includes('/login')) {
          window.location.assign('/login');
        }
        return;
      }

      if (isTokenExpired(storedToken, SESSION_WARNING_MS) && !warned) {
        warned = true;
        const decoded = validateTokenClaims(storedToken).decoded;
        const expiresInMs = decoded?.exp ? decoded.exp * 1000 - Date.now() : 0;
        emitSessionExpiring(Math.max(0, expiresInMs));
      }
    };

    checkSession();
    const intervalId = window.setInterval(checkSession, SESSION_CHECK_MS);
    return () => window.clearInterval(intervalId);
  }, [token, logout]);

  const login = async (email, password, rememberMe = false) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: accessToken, user: apiUser } = res.data;
      const validation = validateTokenClaims(accessToken);
      if (!validation.valid) {
        return {
          success: false,
          error: 'Jeton de session invalide renvoyé par le serveur.',
        };
      }

      persistAuthToken(accessToken, rememberMe);
      const sessionUser = userFromToken(validation.decoded, apiUser);
      if (useHttpOnlyAuthCookie()) {
        setToken('cookie');
        setUser(sessionUser);
        delete api.defaults.headers.common.Authorization;
        return { success: true, user: sessionUser };
      }
      setToken(accessToken);
      setUser(sessionUser);
      api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      return { success: true, user: sessionUser };
    } catch (error) {
      const st = error.response?.status;
      const demo = tryDemoLogin(email, password);
      if (demo.success) {
        const validation = validateTokenClaims(demo.token);
        if (validation.valid) {
          persistAuthToken(demo.token, rememberMe);
          setToken(demo.token);
          setUser(demo.user);
          api.defaults.headers.common.Authorization = `Bearer ${demo.token}`;
          return { success: true, user: demo.user, demo: true };
        }
      }
      if (!error.response || st === 502 || st === 503) {
        if (demo.success === false && getDemoAccountByEmail(email)) {
          return {
            success: false,
            error: 'Identifiants démo incorrects. Vérifiez email et mot de passe.',
          };
        }
        return {
          success: false,
          error:
            error.backendErrorMessage ||
            'Le serveur API ne répond pas (502). Lancez le backend sur le port indiqué dans backend/.env et vérifiez VITE_API_PROXY_TARGET dans le frontend.',
        };
      }
      return {
        success: false,
        error: mapAuthError(
          error.response?.data?.error || error.response?.data?.message,
          'Erreur de connexion. Réessayez.'
        ),
      };
    }
  };

  const register = async (data, rememberMe = false) => {
    try {
      const res = await api.post('/auth/register', data);
      const { token: accessToken, user: apiUser } = res.data;
      const validation = validateTokenClaims(accessToken);
      if (!validation.valid) {
        return {
          success: false,
          error: 'Jeton de session invalide renvoyé par le serveur.',
        };
      }

      persistAuthToken(accessToken, rememberMe);
      const sessionUser = userFromToken(validation.decoded, apiUser);
      setToken(accessToken);
      setUser(sessionUser);
      api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      return { success: true, user: sessionUser };
    } catch (error) {
      const st = error.response?.status;
      if (!error.response || st === 502 || st === 503) {
        return {
          success: false,
          error:
            error.backendErrorMessage ||
            'Le serveur API ne répond pas. Vérifiez que le backend tourne et que le proxy Vite (VITE_API_PROXY_TARGET) correspond au PORT du backend.',
        };
      }
      return {
        success: false,
        error: mapAuthError(
          error.response?.data?.error || error.response?.data?.message,
          "Erreur lors de l'inscription."
        ),
      };
    }
  };

  const value = {
    user,
    setUser,
    token,
    loading,
    authError,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
