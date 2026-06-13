/** Journal d'activité centralisé — toutes actions plateforme (persistant session + localStorage). */

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

/** Enregistre une action (appelé par vendor, modérateur, admin…). */
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
  const store = getLogStore();
  store.unshift(entry);
  if (store.length > MAX_LOGS) store.length = MAX_LOGS;
  saveToStorage(store);
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
  memoryLogs = seeded.sort((a, b) => new Date(b.at) - new Date(a.at));
  saveToStorage(memoryLogs);
  return memoryLogs;
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

export const exportLogsJson = (filters = {}) => {
  const logs = fetchActivityLogs(filters);
  const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `petfoodtn-logs-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportLogsCsv = (filters = {}) => {
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
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `petfoodtn-logs-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

export { ROLE_LABELS };
