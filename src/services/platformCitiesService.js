import api from '../utils/api';
import { DEMO_CITIES_PACK } from '../utils/adminDemoData';

export const fetchPublicCities = async () => {
  try {
    const data = await api.get('/platform/cities').then((r) => r.data);
    return { data, demo: false };
  } catch {
    return { data: DEMO_CITIES_PACK, demo: true };
  }
};

export const fetchCitiesPack = async () => {
  try {
    const data = await api.get('/platform/cities/pack').then((r) => r.data);
    return { data, demo: data.mode === 'demo' };
  } catch {
    return { data: DEMO_CITIES_PACK, demo: true };
  }
};

export const updatePlatformCity = (id, body) =>
  api.patch(`/platform/cities/${id}`, body).then((r) => r.data);

export const createPlatformCity = (body) =>
  api.post('/platform/cities', body).then((r) => r.data);

export const exportCities = () =>
  api.get('/platform/cities/export').then((r) => r.data);

export const importCities = (rows) =>
  api.post('/platform/cities/import', { rows }).then((r) => r.data);
