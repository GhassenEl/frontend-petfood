import api from '../utils/api';

export const fetchAdminStockOverview = () =>
  api.get('/admin/stock/overview').then((r) => r.data);

export const fetchAdminStockMovements = (limit = 50) =>
  api.get('/admin/stock/movements', { params: { limit } }).then((r) => r.data);

export const adjustAdminStock = (productId, body) =>
  api.patch(`/admin/stock/products/${productId}/adjust`, body).then((r) => r.data);

export const updateAdminStockThresholds = (productId, body) =>
  api.patch(`/admin/stock/products/${productId}/thresholds`, body).then((r) => r.data);

export const bulkReorderAdminStock = (productIds = []) =>
  api.post('/admin/stock/reorder', { productIds }).then((r) => r.data);
