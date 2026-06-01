import api from './httpClient';

export async function getMessages() {
  const { data } = await api.get('/messages');
  return data || [];
}

export async function sendMessage(receiverId, message, orderId = null) {
  const payload = { receiverId, message: message.trim() };
  if (orderId) payload.orderId = orderId;
  const { data } = await api.post('/messages', payload);
  return data;
}

export async function getUnreadCount() {
  const { data } = await api.get('/messages/unread');
  return data?.unread || 0;
}

export async function getMessagePartners() {
  const { data } = await api.get('/users');
  return (data || []).filter((u) => ['client', 'livreur'].includes(u.role));
}
