import api from './httpClient';

export async function getMyComplaints() {
  const { data } = await api.get('/complaints');
  return Array.isArray(data) ? data : [];
}

export async function createComplaint(payload) {
  const { data } = await api.post('/complaints', {
    subject: payload.subject,
    message: payload.message,
    orderId: payload.orderId || null,
    category: payload.category,
  });
  return data;
}

export async function deleteComplaint(id) {
  await api.delete(`/complaints/${id}`);
}

/** Admin */
export async function getAllComplaints() {
  const { data } = await api.get('/complaints/all');
  return Array.isArray(data) ? data : [];
}

export async function createAdminComplaint(payload) {
  const { data } = await api.post('/complaints/admin', payload);
  return data;
}

export async function updateComplaint(id, payload) {
  const { data } = await api.put(`/complaints/${id}`, payload);
  return data;
}
