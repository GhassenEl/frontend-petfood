import { useState, useCallback } from 'react';
import api from '../services/api';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (method, url, data = null, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api[method](url, data, options);
      setLoading(false);
      return { success: true, data: response.data };
    } catch (err) {
      setLoading(false);
      const message = err.response?.data?.error || err.message || 'Une erreur est survenue';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const get = useCallback((url, options) => request('get', url, null, options), [request]);
  const post = useCallback((url, data, options) => request('post', url, data, options), [request]);
  const put = useCallback((url, data, options) => request('put', url, data, options), [request]);
  const del = useCallback((url, options) => request('delete', url, null, options), [request]);

  return { loading, error, get, post, put, delete: del };
};

export default useApi;

