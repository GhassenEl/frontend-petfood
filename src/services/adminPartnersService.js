import api from '../utils/api';

export const fetchPartnersOverview = () =>
  api.get('/admin/partners/overview').then((r) => r.data);

export const fetchSupplySuppliers = () =>
  api.get('/admin/partners/suppliers').then((r) => r.data);

export const createSupplySupplier = (body) =>
  api.post('/admin/partners/suppliers', body).then((r) => r.data);

export const updateSupplySupplier = (id, body) =>
  api.patch(`/admin/partners/suppliers/${id}`, body).then((r) => r.data);

export const upsertShelter = (body) =>
  api.post('/admin/partners/shelters', body).then((r) => r.data);

export const upsertRelayPoint = (body) =>
  api.post('/admin/partners/relay-points', body).then((r) => r.data);
