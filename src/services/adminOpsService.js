import api from '../utils/api';

export const fetchAdminStockBiPack = () =>
  api.get('/admin/stock-bi/pack').then((r) => r.data);

export const registerForEvent = (eventId, body) =>
  api.post(`/events/${eventId}/register`, body).then((r) => r.data);

export const fetchMyEventPrizes = () =>
  api.get('/events/my-prizes').then((r) => r.data);

export const fetchBirthdaySuggestions = () =>
  api.get('/events/birthday/suggestions').then((r) => r.data);

export const reserveBirthdayEvent = (body) =>
  api.post('/events/birthday/reserve', body).then((r) => r.data);
