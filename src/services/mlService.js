import api from '../utils/api';

export const fetchClientMlPack = () => api.get('/ml/client/pack').then((r) => r.data);

export const fetchClientMlAgentPack = () => api.get('/ml/client/agent').then((r) => r.data);

export const fetchAdminOrdersRisk = () => api.get('/ml/admin/orders-risk').then((r) => r.data);

export const fetchAdminMlInsights = () => api.get('/ml/admin/insights').then((r) => r.data);

export const fetchIntelligenceSuite = () => api.get('/ml/intelligence/pack').then((r) => r.data);

export const fetchAdminMlPack = () => api.get('/ml/admin/pack').then((r) => r.data);

export const fetchAdminMlAgentPack = () => api.get('/ml/admin/agent').then((r) => r.data);

export const fetchLivreurMlPack = () => api.get('/ml/livreur/pack').then((r) => r.data);

export const fetchLivreurOrdersRisk = () => api.get('/ml/livreur/orders-risk').then((r) => r.data);

export const fetchVetMlPack = () => api.get('/ml/vet/pack').then((r) => r.data);

export const fetchVetMlAgentPack = () => api.get('/ml/vet/agent').then((r) => r.data);

export const fetchClinicMlAgentPack = () => api.get('/ml/vet/clinic/agent').then((r) => r.data);

export const fetchPharmacyMlAgentPack = () => api.get('/ml/vet/pharmacy/agent').then((r) => r.data);

export const fetchVetClinicalMlAgentPack = () => api.get('/ml/vet/clinical/agent').then((r) => r.data);

export const postVetClinicalAnalyze = (body) =>
  api.post('/ml/vet/clinical/analyze', body).then((r) => r.data);

export const postVetEarlyDetection = (body) =>
  api.post('/ml/vet/early-detection/analyze', body).then((r) => r.data);

export const fetchVetClinicalPatientContext = (params) =>
  api.get('/ml/vet/clinical/patient-context', { params }).then((r) => r.data);

export const postVetClinicalApplyDossier = (analysisId) =>
  api.post(`/ml/vet/clinical/analyses/${analysisId}/apply-dossier`).then((r) => r.data);

export const postVetClinicalApplyPrescription = (analysisId) =>
  api.post(`/ml/vet/clinical/analyses/${analysisId}/apply-prescription`).then((r) => r.data);

export const fetchNlpModelBenchmark = () =>
  api.get('/ml/admin/nlp-models/benchmark').then((r) => r.data);

export const updateNlpModelConfig = (body) =>
  api.put('/ml/admin/nlp-models/config', body).then((r) => r.data);

export const postNlpAnalyze = (text) =>
  api.post('/ml/nlp/analyze', { text }).then((r) => r.data);

export const postAnalyzeComment = (body) =>
  api.post('/ml/sentiment/comment', body).then((r) => r.data);

export const fetchMyCommentSentiments = () =>
  api.get('/ml/sentiment/comments/me').then((r) => r.data);

export const fetchAdminCommentSentiments = () =>
  api.get('/ml/sentiment/comments').then((r) => r.data);
