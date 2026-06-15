/** Service admin — configuration système, modérateurs, journaux. */

import api from '../utils/api';
import {
  DEMO_SYSTEM_CONFIG,
  DEMO_ACTIVITY_LOGS,
  DEMO_ADMIN_USERS,
  DEMO_VISITOR_ADMIN_CONFIG,
  DEMO_VISITOR_STATS,
} from '../utils/adminDemoData';
import {
  fetchActivityLogs,
  seedActivityLogs,
  logActivity,
  exportLogsJson,
  exportLogsCsv,
} from './activityLogService';

const CONFIG_KEY = 'petfood_system_config';
const VISITOR_CONFIG_KEY = 'petfood_visitor_admin_config';

const loadConfig = () => {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) return { ...DEMO_SYSTEM_CONFIG, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return { ...DEMO_SYSTEM_CONFIG };
};

const saveConfig = (cfg) => {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
};

export const fetchSystemConfig = async () => {
  try {
    const data = await api.get('/admin/system/config').then((r) => r.data);
    return { data, demo: false };
  } catch {
    return { data: loadConfig(), demo: true };
  }
};

export const updateSystemConfig = async (patch) => {
  try {
    const data = await api.patch('/admin/system/config', patch).then((r) => r.data);
    logActivity({
      actorRole: 'admin',
      actorName: 'Administrateur',
      action: 'config_update',
      target: 'Configuration système',
      details: Object.keys(patch).join(', '),
      module: 'admin',
    });
    return { data, demo: false };
  } catch {
    const next = { ...loadConfig(), ...patch, updatedAt: new Date().toISOString() };
    saveConfig(next);
    logActivity({
      actorRole: 'admin',
      actorName: 'Administrateur',
      action: 'config_update',
      target: 'Configuration système',
      details: Object.keys(patch).join(', '),
      module: 'admin',
    });
    return { data: next, demo: true };
  }
};

export const fetchAdminModerators = async () => {
  try {
    const data = await api.get('/admin/moderators').then((r) => r.data);
    return { data, demo: false };
  } catch {
    const moderators = DEMO_ADMIN_USERS.filter((u) => u.role === 'moderator');
    return { data: { moderators }, demo: true };
  }
};

export const createAdminModerator = async (body) => {
  try {
    const data = await api.post('/admin/moderators', body).then((r) => r.data);
    logActivity({
      actorRole: 'admin',
      actorName: 'Administrateur',
      action: 'moderator_create',
      target: body.email,
      module: 'admin',
    });
    return { data, demo: false };
  } catch {
    const mod = {
      id: `demo-mod-${Date.now()}`,
      _id: `demo-mod-${Date.now()}`,
      name: body.name,
      email: body.email,
      role: 'moderator',
      phone: body.phone || '',
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    logActivity({
      actorRole: 'admin',
      actorName: 'Administrateur',
      action: 'moderator_create',
      target: mod.email,
      module: 'admin',
    });
    return { data: mod, demo: true };
  }
};

export const updateAdminModeratorStatus = async (id, isActive) => {
  try {
    const data = await api.patch(`/admin/moderators/${id}`, { isActive }).then((r) => r.data);
    logActivity({
      actorRole: 'admin',
      actorName: 'Administrateur',
      action: isActive ? 'moderator_reactivate' : 'moderator_suspend',
      target: id,
      module: 'admin',
    });
    return { data, demo: false };
  } catch {
    logActivity({
      actorRole: 'admin',
      actorName: 'Administrateur',
      action: isActive ? 'moderator_reactivate' : 'moderator_suspend',
      target: id,
      module: 'admin',
    });
    return { data: { id, isActive }, demo: true };
  }
};

export const fetchAdminActivityLogs = async (filters = {}) => {
  try {
    const data = await api.get('/admin/activity-logs', { params: filters }).then((r) => r.data);
    return {
      data: data.logs || data,
      total: data.total ?? (data.logs || data).length,
      demo: false,
      source: data.source || 'server',
    };
  } catch {
    seedActivityLogs(DEMO_ACTIVITY_LOGS);
    const local = fetchActivityLogs(filters);
    return { data: local, total: local.length, demo: true, source: 'local' };
  }
};

const loadVisitorConfig = () => {
  try {
    const raw = localStorage.getItem(VISITOR_CONFIG_KEY);
    if (raw) return { ...DEMO_VISITOR_ADMIN_CONFIG, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return { ...DEMO_VISITOR_ADMIN_CONFIG };
};

const saveVisitorConfig = (cfg) => {
  localStorage.setItem(VISITOR_CONFIG_KEY, JSON.stringify(cfg));
};

export const fetchVisitorAdminConfig = async () => {
  try {
    const data = await api.get('/admin/visitors/config').then((r) => r.data);
    return { data, stats: DEMO_VISITOR_STATS, demo: false };
  } catch {
    return { data: loadVisitorConfig(), stats: DEMO_VISITOR_STATS, demo: true };
  }
};

export const updateVisitorAdminConfig = async (patch) => {
  try {
    const data = await api.patch('/admin/visitors/config', patch).then((r) => r.data);
    logActivity({
      actorRole: 'admin',
      actorName: 'Administrateur',
      action: 'visitor_config_update',
      target: 'Espace visiteur',
      module: 'admin',
    });
    return { data, demo: false };
  } catch {
    const next = { ...loadVisitorConfig(), ...patch, updatedAt: new Date().toISOString() };
    saveVisitorConfig(next);
    logActivity({
      actorRole: 'admin',
      actorName: 'Administrateur',
      action: 'visitor_config_update',
      target: 'Espace visiteur',
      module: 'admin',
    });
    return { data: next, demo: true };
  }
};

export { exportLogsJson, exportLogsCsv, logActivity };

/** Lecture synchrone config globale (contexte client, bannières maintenance…). */
export const getSystemConfigSync = () => loadConfig();
