/** Journal d'activité — persistance serveur + cache local de secours. */

import api from '../utils/api';

const STORAGE_KEY = 'petfood_activity_logs';
const MAX_LOGS = 2000;

const ROLE_LABELS = {
  admin: 'Admin',
  vendor: 'Vendeur',
  moderator: 'Modérateur',
  client: 'Client',
  livreur: 'Livreur',
  vet: 'Vétérinaire',
  system: 'Système',
};

let memoryLogs = null;

const uid = () => `log-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return null;
};

const saveToStorage = (logs) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs.slice(0, MAX_LOGS)));
  } catch {
    /* quota */
  }
};

export const getLogStore = () => {
  if (!memoryLogs) {
    memoryLogs = loadFromStorage() || [];
  }
  return memoryLogs;
};

const appendLocal = (entry) => {
  const store = getLogStore();
  store.unshift(entry);
  if (store.length > MAX_LOGS) store.length = MAX_LOGS;
  saveToStorage(store);
  return entry;
};

/** Enregistre une action — serveur en priorité, localStorage en secours. */
export const logActivity = ({
  actorRole = 'system',
  actorId = null,
  actorName = 'Système',
  action,
  target = '',
  details = '',
  module = 'platform',
}) => {
  if (!action) return null;

  const entry = {
    id: uid(),
    at: new Date().toISOString(),
    actorRole,
    actorId,
    actorName,
    action,
    target,
    details,
    module,
  };

  appendLocal(entry);

  api
    .post('/activity-logs', {
      action,
      target,
      details,
      module,
      actorRole,
      actorName,
    })
    .catch(() => {
      /* backend indisponible — entrée locale conservée */
    });

  return entry;
};

export const seedActivityLogs = (entries) => {
  const store = getLogStore();
  if (store.length > 0) return store;
  const seeded = (entries || []).map((e) => ({
    id: e.id || uid(),
    at: e.at || new Date().toISOString(),
    ...e,
  }));
  memoryLogs = seeded;
  saveToStorage(seeded);
  return seeded;
};

export const fetchActivityLogs = (filters = {}) => {
  let logs = [...getLogStore()];
  if (filters.role && filters.role !== 'all') {
    logs = logs.filter((l) => l.actorRole === filters.role);
  }
  if (filters.module && filters.module !== 'all') {
    logs = logs.filter((l) => l.module === filters.module);
  }
  const q = String(filters.search || '').trim().toLowerCase();
  if (q) {
    logs = logs.filter(
      (l) =>
        l.action?.toLowerCase().includes(q) ||
        l.target?.toLowerCase().includes(q) ||
        l.actorName?.toLowerCase().includes(q) ||
        l.details?.toLowerCase().includes(q),
    );
  }
  const limit = Number(filters.limit) || 500;
  return logs.slice(0, limit);
};

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportLogsJson = async (filters = {}) => {
  try {
    const res = await api.get('/admin/activity-logs/export.json', {
      params: filters,
      responseType: 'blob',
    });
    const name = `petfoodtn-audit-${new Date().toISOString().slice(0, 10)}.json`;
    downloadBlob(new Blob([res.data], { type: 'application/json' }), name);
    return;
  } catch {
    const logs = fetchActivityLogs(filters);
    downloadBlob(
      new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' }),
      `petfoodtn-logs-${new Date().toISOString().slice(0, 10)}.json`,
    );
  }
};

export const exportLogsCsv = async (filters = {}) => {
  try {
    const res = await api.get('/admin/activity-logs/export.csv', {
      params: filters,
      responseType: 'blob',
    });
    const name = `petfoodtn-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    downloadBlob(new Blob([res.data], { type: 'text/csv' }), name);
    return;
  } catch {
    const logs = fetchActivityLogs(filters);
    const header = ['date', 'role', 'acteur', 'action', 'cible', 'module', 'details'];
    const rows = logs.map((l) =>
      [
        l.at,
        ROLE_LABELS[l.actorRole] || l.actorRole,
        l.actorName,
        l.action,
        l.target,
        l.module,
        (l.details || '').replace(/"/g, '""'),
      ]
        .map((c) => `"${c}"`)
        .join(','),
    );
    const csv = [header.join(','), ...rows].join('\n');
    downloadBlob(
      new Blob([csv], { type: 'text/csv;charset=utf-8' }),
      `petfoodtn-logs-${new Date().toISOString().slice(0, 10)}.csv`,
    );
  }
};

export { ROLE_LABELS };
