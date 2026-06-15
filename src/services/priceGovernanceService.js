import api from '../utils/api';
import { DEMO_PRICE_GOVERNANCE_PACK } from '../utils/adminDemoData';
import { logActivity } from './activityLogService';

export const fetchPriceGovernancePack = async () => {
  try {
    const data = await api.get('/admin/prices/pack').then((r) => r.data);
    return { data, demo: data.mode === 'demo' };
  } catch {
    return { data: DEMO_PRICE_GOVERNANCE_PACK, demo: true };
  }
};

export const updatePricePolicy = async (patch) => {
  try {
    const data = await api.patch('/admin/prices/policy', patch).then((r) => r.data);
    logActivity({
      actorRole: 'admin',
      actorName: 'Administrateur',
      action: 'price_policy_update',
      target: 'Politique tarifaire',
      details: Object.keys(patch).join(', '),
      module: 'admin',
    });
    return { data, demo: false };
  } catch {
    const next = { ...DEMO_PRICE_GOVERNANCE_PACK.policy, ...patch };
    return { data: next, demo: true };
  }
};

export const updateProductPriceAdmin = (productId, body) =>
  api.patch(`/admin/prices/products/${productId}`, body).then((r) => r.data);

export const approvePriceChange = (id) =>
  api.post(`/admin/prices/pending/${id}/approve`).then((r) => r.data);

export const rejectPriceChange = (id, reason) =>
  api.post(`/admin/prices/pending/${id}/reject`, { reason }).then((r) => r.data);

export const bulkUpdatePrices = (body) =>
  api.post('/admin/prices/bulk-update', body).then((r) => r.data);

export const verifyAllPrices = () =>
  api.post('/admin/prices/verify-all').then((r) => r.data);

export const exportPrices = () =>
  api.get('/admin/prices/export').then((r) => r.data);

export const importPrices = (rows) =>
  api.post('/admin/prices/import', { rows }).then((r) => r.data);
