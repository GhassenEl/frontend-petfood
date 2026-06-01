import api from './httpClient';

export async function getMyReviews() {
  const { data } = await api.get('/reviews');
  return Array.isArray(data) ? data : [];
}

/** Admin : tous les avis produits */
export async function getAllReviews() {
  const { data } = await api.get('/reviews');
  return Array.isArray(data) ? data : [];
}

export async function createReview(payload) {
  const { data } = await api.post('/reviews', payload);
  return data;
}

export async function updateReview(id, payload) {
  const { data } = await api.put(`/reviews/${id}`, payload);
  return data;
}

export async function deleteReview(id) {
  await api.delete(`/reviews/${id}`);
}
