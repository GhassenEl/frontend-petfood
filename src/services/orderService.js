import api from './httpClient';

export async function getOrders() {
  const { data } = await api.get('/orders');
  return data;
}

export async function deleteOrder(id) {
  await api.delete(`/orders/${id}`);
}

export async function cancelOrder(id, body = {}) {
  const { data } = await api.post(`/orders/${id}/cancel`, body);
  return data;
}

export async function livreurCancelOrder(orderId, body = {}) {
  const { data } = await api.post(`/livreur/orders/${orderId}/cancel`, body);
  return data;
}

export async function createOrder(payload) {
  const { data } = await api.post('/orders', payload);
  return data;
}

export async function getOrderById(id) {
  const { data } = await api.get(`/orders/${id}`);
  return data;
}
