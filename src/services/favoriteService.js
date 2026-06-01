import api from './httpClient';

export async function getFavorites() {
  const { data } = await api.get('/favorites');
  return data;
}

export async function getFavoriteIds() {
  const { data } = await api.get('/favorites/ids');
  return data.productIds || [];
}

export async function addFavorite(productId) {
  const { data } = await api.post(`/favorites/${productId}`);
  return data;
}

export async function removeFavorite(productId) {
  await api.delete(`/favorites/${productId}`);
}

export async function getFrequentProducts(limit = 8) {
  const { data } = await api.get('/favorites/frequent', { params: { limit } });
  return data;
}
