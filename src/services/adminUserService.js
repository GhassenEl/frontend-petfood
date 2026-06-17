import api from '../utils/api';

export const approveVendor = async (vendorId) => {
  try {
    const res = await api.patch(`/admin/vendors/${vendorId}`, { status: 'active' });
    return res.data;
  } catch {
    return { id: vendorId, status: 'active', mode: 'demo' };
  }
};

export const rejectVendor = async (vendorId, reason = '') => {
  try {
    const res = await api.patch(`/admin/vendors/${vendorId}`, { status: 'rejected', reason });
    return res.data;
  } catch {
    return { id: vendorId, status: 'rejected', mode: 'demo' };
  }
};

export const approveVet = async (userId) => {
  try {
    const res = await api.patch(`/users/${userId}`, { vetValidated: true, isActive: true });
    return res.data;
  } catch {
    return { id: userId, vetValidated: true, mode: 'demo' };
  }
};

export const rejectVet = async (userId) => {
  try {
    const res = await api.patch(`/users/${userId}`, { vetValidated: false, isActive: false });
    return res.data;
  } catch {
    return { id: userId, vetValidated: false, mode: 'demo' };
  }
};

export const suspendUser = async (userId) => {
  try {
    const res = await api.patch(`/users/${userId}/active`, { isActive: false });
    return res.data;
  } catch {
    return { id: userId, isActive: false, mode: 'demo' };
  }
};

export default { approveVendor, rejectVendor, approveVet, rejectVet, suspendUser };
