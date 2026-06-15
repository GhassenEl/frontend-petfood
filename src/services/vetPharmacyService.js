import api from '../utils/api';

export const fetchVetPharmacyCatalog = () =>
  api.get('/vet/pharmacy/medications').then((r) => r.data);

export const fetchVetPharmacyAlerts = () =>
  api.get('/vet/pharmacy/stock-alerts').then((r) => r.data);

export const fetchVetPharmacyMovements = (limit = 30) =>
  api.get('/vet/pharmacy/movements', { params: { limit } }).then((r) => r.data);

export const createVetMedication = (body) =>
  api.post('/vet/pharmacy/medications', body).then((r) => r.data);

export const adjustVetMedicationStock = (medicationId, body) =>
  api.patch(`/vet/pharmacy/medications/${medicationId}/adjust`, body).then((r) => r.data);

export const updateVetMedicationThresholds = (medicationId, body) =>
  api.patch(`/vet/pharmacy/medications/${medicationId}/thresholds`, body).then((r) => r.data);
