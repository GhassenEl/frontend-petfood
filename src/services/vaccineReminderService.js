import api from './httpClient';

export async function getVaccineReminders() {
  const { data } = await api.get('/pets/vaccine-reminders');
  return Array.isArray(data) ? data : [];
}
