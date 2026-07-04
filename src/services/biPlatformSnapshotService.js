import api from '../utils/api';
import { allowDemoFallback } from '../config/liveDataPolicy';
import { fetchAdminLivePresence } from './adminPresenceService';
import { fetchRealtimeStats } from './realtimeStatsService';
import { enrichIoTPack } from '../utils/iotIntelligenceEngine';
import { buildIoTAnomalies } from '../utils/iotAnomalyEngine';
import {
  DEMO_ADMIN_USERS,
  DEMO_ADMIN_VET_RECORDS,
} from '../utils/adminDemoData';
import { DEMO_IOT_PACK } from '../utils/clientDemoData';

const pickList = (apiList, demoList) => {
  if (Array.isArray(apiList) && apiList.length > 0) return apiList;
  return allowDemoFallback() ? demoList : [];
};

const summarizeIoT = (pack) => {
  const counts = pack?.counts || {};
  const devices = pack?.devices || [];
  const online = devices.filter((d) => d.status === 'online').length;
  const anomalies = pack?.anomalies?.length
    ? pack.anomalies
    : buildIoTAnomalies(pack);
  const critical = anomalies.filter((a) => a.severity === 'high' || a.severity === 'critical').length;

  return {
    mode: pack?.mode || 'unknown',
    healthScore: pack?.healthScore ?? null,
    devicesTotal: devices.length,
    devicesOnline: online,
    alerts: counts.alerts ?? anomalies.length,
    criticalAlerts: counts.criticalAlerts ?? critical,
    topAnomalies: anomalies.slice(0, 5),
    feedersOnline: counts.feedersOnline ?? 0,
    camsOnline: counts.feederCamsOnline ?? 0,
  };
};

async function loadIoTSnapshot() {
  try {
    const { data } = await api.get('/client/iot/pack');
    if (data?.devices?.length) {
      return summarizeIoT(enrichIoTPack({ ...data, mode: data.mode || 'live' }));
    }
  } catch {
    /* fallback */
  }
  if (allowDemoFallback()) {
    return summarizeIoT(enrichIoTPack({ ...DEMO_IOT_PACK, mode: 'demo' }));
  }
  return summarizeIoT({ devices: [], counts: {}, mode: 'live' });
}

function summarizeVet({ records, upcoming, vets }) {
  const active = records.filter((r) => r.status === 'active' || !r.status).length;
  const dueSoon = records.filter((r) => {
    if (!r.nextVisit) return false;
    const d = new Date(r.nextVisit);
    const inDays = (d - Date.now()) / (1000 * 60 * 60 * 24);
    return inDays >= 0 && inDays <= 14;
  }).length;

  return {
    recordsTotal: records.length,
    activeCases: active,
    upcomingAppointments: Array.isArray(upcoming) ? upcoming.length : 0,
    followUpsDue: dueSoon,
    vetPartners: vets.length,
    recentRecords: records.slice(0, 5),
    upcomingList: (Array.isArray(upcoming) ? upcoming : []).slice(0, 5),
  };
}

function summarizeAudience(presence) {
  const live = presence?.live || {};
  const totals = live.totals || {};
  const registered = presence?.registered || {};

  return {
    onlineTotal: live.onlineTotal ?? 0,
    visitors: totals.visitor ?? 0,
    clients: totals.client ?? 0,
    vets: totals.vet ?? 0,
    livreurs: totals.livreur ?? 0,
    vendors: totals.vendor ?? 0,
    registeredTotal: registered.total ?? registered.count ?? null,
    topRegions: (live.byRegion || live.regions || []).slice(0, 5),
    sessions: (live.sessions || []).slice(0, 6),
  };
}

export async function loadBiPlatformSnapshot() {
  const [
    presence,
    iot,
    vetRecordsRes,
    vetUpcomingRes,
    usersRes,
    adminStatsRes,
  ] = await Promise.all([
    fetchAdminLivePresence().catch(() => null),
    loadIoTSnapshot(),
    api.get('/veterinary').catch(() => ({ data: [] })),
    api.get('/veterinary/upcoming/all').catch(() => ({ data: [] })),
    api.get('/users').catch(() => ({ data: [] })),
    fetchRealtimeStats('admin').catch(() => ({ data: null, demo: true })),
  ]);

  const records = pickList(
    Array.isArray(vetRecordsRes?.data) ? vetRecordsRes.data : [],
    DEMO_ADMIN_VET_RECORDS,
  );
  const upcoming = pickList(
    Array.isArray(vetUpcomingRes?.data) ? vetUpcomingRes.data : [],
    [],
  );
  const users = pickList(
    Array.isArray(usersRes?.data) ? usersRes.data : [],
    DEMO_ADMIN_USERS,
  );
  const vets = users.filter((u) => u.role === 'vet');

  const adminKpis = adminStatsRes?.data?.kpis || [];
  const ordersToday = adminKpis.find((k) => /commande|order/i.test(k.label || ''))?.value;

  return {
    audience: summarizeAudience(presence),
    vet: summarizeVet({ records, upcoming, vets }),
    iot,
    commerce: {
      ordersToday: ordersToday ?? adminKpis[0]?.value ?? null,
      livePrimary: adminStatsRes?.data?.livePrimary ?? null,
      demo: adminStatsRes?.demo ?? false,
    },
    loadedAt: new Date().toISOString(),
  };
}

export default loadBiPlatformSnapshot;
