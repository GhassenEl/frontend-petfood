import { fetchLiveMetricsTimeseries } from './devopsStatusService';
import {
  GRAFANA_DASHBOARD_CATALOG,
  DASHBOARD_AUTOMATION_PIPELINE,
  resolveGrafanaBaseUrl,
} from '../config/devopsDashboardCatalog';

const buildDemoStatus = () => ({
  mode: 'demo',
  grafanaBaseUrl: resolveGrafanaBaseUrl(),
  grafanaUp: false,
  prometheusUp: false,
  dashboards: GRAFANA_DASHBOARD_CATALOG.map((d) => ({ ...d, status: 'provisioned' })),
  pipeline: DASHBOARD_AUTOMATION_PIPELINE,
  metrics: {
    usersOnline: 4,
    vetActiveCases: 3,
    iotAlerts: 5,
    ordersTotal: 128,
  },
  lastSync: null,
});

export async function fetchDashboardAutomationStatus() {
  const grafanaBaseUrl = resolveGrafanaBaseUrl();
  let metricsData = null;

  try {
    metricsData = await fetchLiveMetricsTimeseries(30);
  } catch {
    metricsData = null;
  }

  const current = metricsData?.current || {};
  const grafanaUp = Boolean(metricsData?.grafanaUp);
  const prometheusUp = Boolean(metricsData?.prometheusUp);

  return {
    mode: metricsData?.demo === false ? 'live' : (metricsData ? 'hybrid' : 'demo'),
    grafanaBaseUrl,
    grafanaUp,
    prometheusUp,
    grafanaUrl: metricsData?.grafanaUrl || grafanaBaseUrl,
    prometheusUrl: metricsData?.prometheusUrl || 'http://127.0.0.1:9090',
    dashboards: GRAFANA_DASHBOARD_CATALOG.map((d) => ({
      ...d,
      status: grafanaUp ? 'synced' : 'file-provisioned',
      href: `${grafanaBaseUrl}${d.grafanaPath}`,
    })),
    pipeline: DASHBOARD_AUTOMATION_PIPELINE,
    metrics: {
      usersOnline: current.usersOnline ?? current.onlineUsers ?? buildDemoStatus().metrics.usersOnline,
      vetActiveCases: current.vetActiveCases ?? buildDemoStatus().metrics.vetActiveCases,
      iotAlerts: current.iotAlerts ?? buildDemoStatus().metrics.iotAlerts,
      ordersTotal: current.orders ?? buildDemoStatus().metrics.ordersTotal,
    },
    lastSync: metricsData?.updatedAt || new Date().toISOString(),
  };
}

export default fetchDashboardAutomationStatus;
