import api from './httpClient';

export async function getVeterinaryRecords() {
  const { data } = await api.get('/veterinary');
  return data;
}

export async function getUpcomingVisits() {
  const { data } = await api.get('/veterinary/upcoming/all');
  return data;
}

export async function getAppointments() {
  const { data } = await api.get('/veterinary/appointments');
  return data;
}

export async function createAppointment(payload) {
  const { data } = await api.post('/veterinary/appointments', payload);
  return data;
}

export async function getPrescriptions() {
  const { data } = await api.get('/veterinary/my/prescriptions');
  return data;
}

export async function getConsultations() {
  const { data } = await api.get('/veterinary/my/consultations');
  return data;
}

export async function getContactRequests() {
  const { data } = await api.get('/veterinary/contact/requests');
  return data;
}

export async function submitContactRequest(payload) {
  const { data } = await api.post('/veterinary/contact', payload);
  return data;
}

export async function respondToContactRequest(id, payload) {
  const { data } = await api.put(`/veterinary/contact/${id}/respond`, payload);
  return data;
}

export async function getAvailability(date) {
  const { data } = await api.get('/veterinary/availability', { params: { date } });
  return data;
}

export async function loadClientVetData() {
  const [records, upcoming, appointments, prescriptions, consultations] = await Promise.all([
    getVeterinaryRecords().catch(() => []),
    getUpcomingVisits().catch(() => []),
    getAppointments().catch(() => []),
    getPrescriptions().catch(() => []),
    getConsultations().catch(() => []),
  ]);
  return { records, upcoming, appointments, prescriptions, consultations };
}
