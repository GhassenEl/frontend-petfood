import api from '../utils/api';

export const fetchTraceabilityList = (params) =>
  api.get('/ecosystem/traceability', { params }).then((r) => r.data);

export const fetchProductTraceability = (productId) =>
  api.get(`/ecosystem/traceability/product/${productId}`).then((r) => r.data);

export const verifyProductTraceability = (productId) =>
  api.post(`/ecosystem/traceability/product/${productId}/verify`).then((r) => r.data);

export const fetchMyOrderTraces = () =>
  api.get('/ecosystem/traceability/my-orders').then((r) => r.data);

export const verifyBatchCode = (batchCode) =>
  api.post('/ecosystem/traceability/verify-batch', { batchCode }).then((r) => r.data);
