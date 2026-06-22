import api from '../utils/api';
import { fetchPlatformPerformance } from './platformPerformanceService';
import { fetchIntrusionEvents, normalizeIntrusionResponse } from './securityService';
import { DEMO_DATABASE_SECURITY } from '../utils/databaseSecurityDemo';

const SQL_TYPES = new Set(['sql_injection', 'sqli', 'sql']);

const isSqlIntrusion = (event) => {
  const type = String(event?.type || '').toLowerCase();
  if (SQL_TYPES.has(type)) return true;
  const detail = String(event?.detail || event?.label || '').toLowerCase();
  return detail.includes('sql') || detail.includes('union select') || detail.includes('drop table');
};

const mapIntrusionRow = (row) => ({
  id: row.id || `sq-${row.at || Date.now()}`,
  at: row.at || row.createdAt || new Date().toISOString(),
  ip: row.ip || '—',
  detail: row.detail || row.label || row.path || '—',
  severity: row.severity || 'medium',
  blocked: row.blocked !== false,
});

const countLast24h = (events) => {
  const cutoff = Date.now() - 24 * 3600000;
  return events.filter((e) => new Date(e.at).getTime() >= cutoff).length;
};

const mergePack = (apiPack, perf, intrusions) => {
  const pack = { ...DEMO_DATABASE_SECURITY, ...apiPack, mode: 'live' };

  if (perf?.database) {
    pack.connection = {
      ...pack.connection,
      ok: perf.database.ok ?? pack.connection.ok,
      latencyMs: perf.database.latencyMs ?? pack.connection.latencyMs,
    };
  }

  const sqlEvents = (intrusions || [])
    .filter(isSqlIntrusion)
    .map(mapIntrusionRow)
    .slice(0, 20);

  if (sqlEvents.length) {
    pack.recentSqlEvents = sqlEvents;
    pack.sqlInjection = {
      ...pack.sqlInjection,
      blocked24h: countLast24h(sqlEvents),
      lastBlockedAt: sqlEvents[0]?.at || pack.sqlInjection?.lastBlockedAt,
    };
  }

  return pack;
};

export async function loadDatabaseSecurityPack() {
  try {
    const [dbRes, perfRes, intrusionsRes] = await Promise.all([
      api.get('/security/database').catch(() => null),
      fetchPlatformPerformance().catch(() => null),
      fetchIntrusionEvents(50).catch(() => null),
    ]);

    const intrusions = normalizeIntrusionResponse(intrusionsRes);

    if (dbRes?.data?.engine || dbRes?.data?.score != null) {
      return mergePack(dbRes.data, perfRes, intrusions);
    }

    return mergePack(DEMO_DATABASE_SECURITY, perfRes, intrusions);
  } catch {
    return { ...DEMO_DATABASE_SECURITY };
  }
}

export default loadDatabaseSecurityPack;
