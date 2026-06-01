import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { jwtDecode } from 'jwt-decode';
import {
  clearAuthToken,
  getStoredToken,
  persistAuthToken,
} from '../utils/authStorage';
import { mapAuthError } from '../utils/authErrors';

const safeJsonError = (err) => {
  if (!err) return null;
  if (typeof err === 'string') return err;
  return err?.message || err?.error || err?.backendErrorMessage || err?.toString?.() || null;
};

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
  const [token, setToken] = useState(null); // Start with null, check localStorage in effect
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Initialize auth state safely
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = getStoredToken();
        
        if (storedToken) {
          // Validate token before setting
          try {
            const decoded = jwtDecode(storedToken);
            
            if (decoded.exp && decoded.exp * 1000 < Date.now()) {
              clearAuthToken();
              setToken(null);
              setUser(null);
            } else {
              setToken(storedToken);
              setUser(decoded);
              api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            }
          } catch (decodeError) {
            console.error('❌ Invalid token, clearing:', decodeError.message);
            clearAuthToken();
            setToken(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('💥 Auth initialization error:', error);
        setAuthError(error.message);
        clearAuthToken();
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password, rememberMe = false) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;
      persistAuthToken(token, rememberMe);
      setToken(token);
      setUser(user);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return { success: true, user };
    } catch (error) {
      const st = error.response?.status;
      if (!error.response || st === 502 || st === 503) {
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
      const { token, user } = res.data;
      persistAuthToken(token, rememberMe);
      setToken(token);
      setUser(user);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return { success: true, user };
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
          'Erreur lors de l\'inscription.'
        ),
      };
    }
  };

  const logout = () => {
    clearAuthToken();
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    setUser,
    token,
    loading,
    authError,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

