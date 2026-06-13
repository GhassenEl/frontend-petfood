import api from '../utils/api';

export const fetchCrmOverview = () => api.get('/admin/crm/overview').then((r) => r.data);

export const fetchCrmSegment = (slug) =>
  api.get(`/admin/crm/segments/${slug}`).then((r) => r.data);

export const fetchCrmMlSuggestions = () =>
  api.get('/admin/crm/ml-suggestions').then((r) => r.data);

export const createCrmCampaign = (body) =>
  api.post('/admin/crm/campaigns', body).then((r) => r.data);

export const sendCrmCampaign = (id) =>
  api.post(`/admin/crm/campaigns/${id}/send`).then((r) => r.data);

export const fetchAdminStockBiPack = () =>
  api.get('/admin/stock-bi/pack').then((r) => r.data);

export const registerForEvent = (eventId, body) =>
  api.post(`/events/${eventId}/register`, body).then((r) => r.data);

export const fetchMyEventPrizes = () =>
  api.get('/events/my-prizes').then((r) => r.data);
