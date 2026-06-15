import api from '../utils/api';

export const fetchPlatformLive = async () => {
  const { data } = await api.get('/platform/live');
  return data;
};

export const PLATFORM_REFRESH_EVENT = 'petfood:platform-refresh';

export const dispatchPlatformRefresh = (detail = null) => {
  window.dispatchEvent(new CustomEvent(PLATFORM_REFRESH_EVENT, { detail }));
};
