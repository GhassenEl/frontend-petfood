import api from '../utils/api';

export const fetchAdminStockBiPack = () =>
  api.get('/admin/stock-bi/pack').then((r) => r.data);

export const registerForEvent = (eventId, body) =>
  api.post(`/events/${eventId}/register`, body).then((r) => r.data);

export const fetchMyEventPrizes = () =>
  api.get('/events/my-prizes').then((r) => r.data);
