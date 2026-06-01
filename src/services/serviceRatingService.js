import api from './httpClient';

export async function getServiceRatings() {
  const { data } = await api.get('/service-ratings');
  return data;
}

export async function getEligibleServiceRatings() {
  const { data } = await api.get('/service-ratings/eligible');
  return data;
}

export async function createServiceRating(payload) {
  const { data } = await api.post('/service-ratings', payload);
  return data;
}

export async function deleteServiceRating(id) {
  await api.delete(`/service-ratings/${id}`);
}

export async function getServiceRatingStats(type = 'delivery') {
  const { data } = await api.get('/service-ratings/stats', { params: { type } });
  return data;
}
