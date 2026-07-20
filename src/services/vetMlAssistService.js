import api from '../utils/api';

export const fetchSpeciesProfiles = () =>
  api.get('/vet/ml/species-profiles').then((r) => r.data);

export const detectAnimal = (body) =>
  api.post('/vet/ml/animal-detect', body).then((r) => r.data);

export const detectAnimalFromImage = (body) =>
  api.post('/vet/ml/animal-detect-image', body).then((r) => r.data);

export const fetchRecentAnimalDetections = (params) =>
  api.get('/vet/ml/animal-detections', { params }).then((r) => r.data);

export const runPrescriptionAssistApi = (body) =>
  api.post('/vet/ml/prescription-assist', body).then((r) => r.data);

export const refinePrescriptionDraft = (draftId, body) =>
  api.post(`/vet/ml/prescription-assist/${draftId}/refine`, body).then((r) => r.data);

export const applyPrescriptionDraft = (draftId) =>
  api.post(`/vet/ml/prescription-drafts/${draftId}/apply`).then((r) => r.data);

export const runDiagnosticAssistApi = (body) =>
  api.post('/vet/ml/diagnostic-assist', body).then((r) => r.data);
