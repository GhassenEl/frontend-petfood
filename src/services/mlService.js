import api from '../utils/api';

export const fetchClientMlPack = () => api.get('/ml/client/pack').then((r) => r.data);

export const fetchClientMlAgentPack = () => api.get('/ml/client/agent').then((r) => r.data);

export const fetchAdminOrdersRisk = () => api.get('/ml/admin/orders-risk').then((r) => r.data);

export const fetchAdminMlInsights = () => api.get('/ml/admin/insights').then((r) => r.data);

export const fetchAdminMlPack = () => api.get('/ml/admin/pack').then((r) => r.data);

export const fetchLivreurMlPack = () => api.get('/ml/livreur/pack').then((r) => r.data);

export const fetchLivreurOrdersRisk = () => api.get('/ml/livreur/orders-risk').then((r) => r.data);

export const fetchVetMlPack = () => api.get('/ml/vet/pack').then((r) => r.data);
