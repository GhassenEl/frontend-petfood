import api from '../utils/api';

export const fetchRoles = () => api.get('/admin/roles').then((r) => r.data);

export const fetchPermissionCatalog = () =>
  api.get('/admin/roles/permissions').then((r) => r.data);

export const createRole = (body) => api.post('/admin/roles', body).then((r) => r.data);

export const updateRole = (id, body) =>
  api.patch(`/admin/roles/${id}`, body).then((r) => r.data);

export const deleteRole = (id) => api.delete(`/admin/roles/${id}`).then((r) => r.data);
