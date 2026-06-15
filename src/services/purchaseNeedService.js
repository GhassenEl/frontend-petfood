import api from '../utils/api';

export const listPurchaseNeeds = (params = {}) =>
  api.get('/purchase-needs', { params }).then((r) => r.data);

export const listMyPurchaseNeeds = () =>
  api.get('/purchase-needs/mine').then((r) => r.data);

export const getPurchaseNeed = (id) =>
  api.get(`/purchase-needs/${id}`).then((r) => r.data);

export const createPurchaseNeed = (payload) =>
  api.post('/purchase-needs', payload).then((r) => r.data);

export const updatePurchaseNeed = (id, payload) =>
  api.patch(`/purchase-needs/${id}`, payload).then((r) => r.data);

export const respondToPurchaseNeed = (id, payload) =>
  api.post(`/purchase-needs/${id}/responses`, payload).then((r) => r.data);

export const updatePurchaseNeedResponse = (needId, responseId, status) =>
  api.patch(`/purchase-needs/${needId}/responses/${responseId}`, { status }).then((r) => r.data);
