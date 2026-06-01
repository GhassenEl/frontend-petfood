import api from './httpClient';

export async function getProducts() {
  const { data } = await api.get('/products');
  return data;
}

export async function getProductRecommendations() {
  const { data } = await api.get('/products/recommendations');
  return data;
}

export async function getNearbyProducts() {
  const { data } = await api.get('/products/nearby');
  return data;
}

export async function getProductById(id) {
  const { data } = await api.get(`/products/${id}`);
  return data;
}
