export const LEAVE_TYPES = [
  { id: 'conge', label: 'Congé', emoji: '🏖️' },
  { id: 'maladie', label: 'Arrêt maladie', emoji: '🩺' },
];

export const LEAVE_STATUSES = {
  pending: { label: 'En attente', color: '#f59e0b', bg: '#fef3c7' },
  approved: { label: 'Approuvé', color: '#16a34a', bg: '#dcfce7' },
  rejected: { label: 'Refusé', color: '#dc2626', bg: '#fee2e2' },
};

export const getLeaveTypeLabel = (id) =>
  LEAVE_TYPES.find((t) => t.id === id)?.label || id;

export const getLeaveStatusMeta = (status) =>
  LEAVE_STATUSES[status] || { label: status, color: '#6b7280', bg: '#f3f4f6' };
