import api from '../utils/api';

/** Santé stack publique (sans auth admin). */
export const fetchStackHealth = () =>
  api.get('/platform/stack-health').then((r) => r.data);

/** Statut DevOps complet (admin). */
export const fetchDevOpsStatus = () =>
  api.get('/platform/devops/status').then((r) => r.data);

/** Séries Prometheus/Grafana temps réel pour courbes admin. */
export const fetchLiveMetricsTimeseries = (rangeMinutes = 30) =>
  api.get('/platform/devops/metrics/live', { params: { rangeMinutes } }).then((r) => r.data);

export default { fetchStackHealth, fetchDevOpsStatus, fetchLiveMetricsTimeseries };
