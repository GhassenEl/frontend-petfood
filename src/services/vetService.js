import api from '../utils/api';

export const getVetClinicalReport = async (ownerId, petName) => {
  const { data } = await api.get('/vet/clinical-report', {
    params: { ownerId, petName },
  });
  return data;
};

export const getVetNutritionRecommendation = async (ownerId, petName) => {
  const { data } = await api.get('/vet/nutrition-recommendation', {
    params: { ownerId, petName },
  });
  return data;
};

export const getVeterinaryRecords = async () => {
  const { data } = await api.get('/veterinary');
  return data;
};

export const getUpcomingVisits = async () => {
  const { data } = await api.get('/veterinary/upcoming/all');
  return data;
};

export const getAppointments = async () => {
  const { data } = await api.get('/veterinary/appointments');
  return data;
};

export const getAvailability = async (date, vetId) => {
  const { data } = await api.get('/veterinary/availability', {
    params: { date, vetId },
  });
  return data;
};

export const createAppointment = async (payload) => {
  const { data } = await api.post('/veterinary/appointments', payload);
  return data;
};

export const getPrescriptions = async () => {
  const { data } = await api.get('/veterinary/my/prescriptions');
  return data;
};

export const getConsultations = async () => {
  const { data } = await api.get('/veterinary/my/consultations');
  return data;
};

export const getContactRequests = async () => {
  const { data } = await api.get('/veterinary/contact/requests');
  return data;
};

export const submitContactRequest = async (payload) => {
  const { data } = await api.post('/veterinary/contact', payload);
  return data;
};

export const respondToContactRequest = async (id, payload) => {
  const { data } = await api.put(`/veterinary/contact/${id}/respond`, payload);
  return data;
};
