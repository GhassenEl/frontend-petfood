import api from './httpClient';

export async function getServiceCatalog() {
  const { data } = await api.get('/service-bookings/catalog');
  return Array.isArray(data) ? data : [];
}

export async function getServiceSlots(date) {
  const { data } = await api.get('/service-bookings/slots', { params: { date } });
  return data;
}

export async function getMyServiceBookings() {
  const { data } = await api.get('/service-bookings');
  return Array.isArray(data) ? data : [];
}

export async function createServiceBooking(payload) {
  const { data } = await api.post('/service-bookings', payload);
  return data;
}

export async function payServiceBooking(id, paymentMethod) {
  const { data } = await api.post(`/service-bookings/${id}/pay`, { paymentMethod });
  return data;
}

export async function cancelServiceBooking(id) {
  const { data } = await api.post(`/service-bookings/${id}/cancel`);
  return data;
}

export async function estimateServicePrice(type, date, endDate) {
  const { data } = await api.get('/service-bookings/estimate', {
    params: { type, date, endDate },
  });
  return data;
}
