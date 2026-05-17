import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { jwtDecode } from 'jwt-decode';

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
    console.log('🔐 AuthContext: Initializing auth...');
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        console.log('🔐 Found stored token:', storedToken ? 'YES' : 'NO');
        
        // If backend is offline we should not block UI forever.
        // Auth initialization here only validates token; backend health will be handled on API calls.
        if (storedToken) {
          // Validate token before setting
          try {
            const decoded = jwtDecode(storedToken);
            console.log('🔐 Token decoded:', decoded);
            
            // Check if token is expired
            if (decoded.exp && decoded.exp * 1000 < Date.now()) {
              console.log('❌ Token expired, clearing');
              localStorage.removeItem('token');
              setToken(null);
              setUser(null);
            } else {
              console.log('✅ Valid token, setting user:', decoded);
              setToken(storedToken);
              setUser(decoded);
              api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            }
          } catch (decodeError) {
            console.error('❌ Invalid token, clearing:', decodeError.message);
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
          }
        } else {
          console.log('ℹ️ No token found, anonymous mode');
        }
      } catch (error) {
        console.error('💥 Auth initialization error:', error);
        setAuthError(error.message);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        console.log('🏁 AuthContext loading complete');
        // Always set loading to false after initialization
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
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
      return { success: false, error: error.response?.data?.error || error.response?.data?.message || error.message || 'Erreur login' };
    }
  };

  const register = async (data) => {
    try {
      const res = await api.post('/auth/register', data);
      const { token, user } = res.data;
      localStorage.setItem('token', token);
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
      return { success: false, error: error.response?.data?.error || error.response?.data?.message || error.message || 'Erreur register' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
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

