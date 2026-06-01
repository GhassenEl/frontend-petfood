import api from './httpClient';

export async function getOrders() {
  const { data } = await api.get('/orders');
  return data;
}

export async function deleteOrder(id) {
  await api.delete(`/orders/${id}`);
}

export async function createOrder(payload) {
  const { data } = await api.post('/orders', payload);
  return data;
}

export async function getOrderById(id) {
  const { data } = await api.get(`/orders/${id}`);
  return data;
}
