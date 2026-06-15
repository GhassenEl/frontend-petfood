import { useCallback, useEffect, useState } from 'react';
import api from '../utils/api';
import { getStoredToken } from '../utils/authStorage';
import { DEMO_CITIES_PACK } from '../utils/adminDemoData';

const STORAGE_KEY = 'petfood_selected_city';

export const getStoredCity = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
};

export const setStoredCity = (city) => {
  try {
    if (city) localStorage.setItem(STORAGE_KEY, city);
    else localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('petfood:city-changed', { detail: city }));
  } catch {
    /* ignore */
  }
};

const usePlatformCity = () => {
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCityState] = useState(getStoredCity);
  const [loading, setLoading] = useState(true);

  const loadCities = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/platform/cities');
      const list = res.data?.cities || [];
      setCities(list);
      if (!getStoredCity() && list[0]?.name) {
        setStoredCity(list[0].name);
        setSelectedCityState(list[0].name);
      }
    } catch {
      const demo = DEMO_CITIES_PACK.cities || [];
      setCities(demo);
      if (!getStoredCity() && demo[0]?.name) {
        setStoredCity(demo[0].name);
        setSelectedCityState(demo[0].name);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCities();
    const onChange = (e) => setSelectedCityState(e.detail || getStoredCity());
    window.addEventListener('petfood:city-changed', onChange);
    return () => window.removeEventListener('petfood:city-changed', onChange);
  }, [loadCities]);

  const setSelectedCity = useCallback(async (city) => {
    setStoredCity(city);
    setSelectedCityState(city);
    if (!getStoredToken()) return;
    try {
      await api.put('/users/profile', { region: city });
    } catch {
      /* optional sync */
    }
  }, []);

  const current = cities.find((c) => c.name === selectedCity) || cities[0] || null;

  return {
    cities,
    selectedCity: selectedCity || current?.name || '',
    setSelectedCity,
    currentCity: current,
    loading,
    reload: loadCities,
  };
};

export default usePlatformCity;
