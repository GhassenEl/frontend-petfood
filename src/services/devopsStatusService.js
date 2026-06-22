import api from '../utils/api';
import {
  buildDemoDevOpsStatus,
  buildDemoStackHealth,
} from '../utils/devopsDemoData';

/** Santé stack publique (sans auth admin). */
export const fetchStackHealth = async () => {
  try {
    const data = await api.get('/platform/stack-health').then((r) => r.data);
    if (data?.services?.length) return { ...data, mode: data.mode || 'live' };
    return buildDemoStackHealth();
  } catch {
    return buildDemoStackHealth();
  }
};

/** Statut DevOps complet (admin). */
export const fetchDevOpsStatus = async () => {
  try {
    const data = await api.get('/platform/devops/status').then((r) => r.data);
    if (data?.services?.length || data?.hero) {
      const demo = buildDemoDevOpsStatus();
      return {
        ...demo,
        ...data,
        mode: data.mode || 'live',
        pipelines: data.pipelines?.length ? data.pipelines : demo.pipelines,
        deployments: data.deployments?.length ? data.deployments : demo.deployments,
        alerts: data.alerts?.length ? data.alerts : demo.alerts,
        envSecrets: data.envSecrets?.length ? data.envSecrets : demo.envSecrets,
      };
    }
    return buildDemoDevOpsStatus();
  } catch {
    return buildDemoDevOpsStatus();
  }
};

const buildDemoMetricsSeries = (rangeMinutes = 30) => {
  const points = Math.min(12, Math.max(6, Math.floor(rangeMinutes / 5)));
  const now = Date.now();
  const mk = (base, variance) => Array.from({ length: points }, (_, i) => ({
    label: new Date(now - (points - 1 - i) * 5 * 60000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    value: Math.round(base + (Math.random() - 0.5) * variance),
  }));
  return {
    source: 'internal',
    prometheusUp: false,
    grafanaUp: false,
    refreshSec: 5,
    current: { apiLatency: 48, orders: 318, esp32Cam: 4, iotSensors: 12, mlQuality: 0.91 },
    panels: {
      apiLatency: mk(48, 20),
      esp32Cam: mk(4, 2),
      iotSensors: mk(12, 4),
      orders: mk(318, 15),
      requests: mk(34, 12),
      mlQuality: mk(0.91, 0.05),
    },
  };
};

/** Séries Prometheus/Grafana temps réel pour courbes admin. */
export const fetchLiveMetricsTimeseries = async (rangeMinutes = 30) => {
  try {
    const data = await api.get('/platform/devops/metrics/live', { params: { rangeMinutes } }).then((r) => r.data);
    if (data?.panels) return data;
    return buildDemoMetricsSeries(rangeMinutes);
  } catch {
    return buildDemoMetricsSeries(rangeMinutes);
  }
};

export default { fetchStackHealth, fetchDevOpsStatus, fetchLiveMetricsTimeseries };
