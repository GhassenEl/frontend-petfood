import { fetchAdminLivePresence } from './adminPresenceService';
import { fetchAnalyticsHub } from './analyticsHubService';
import { loadBiPlatformSnapshot } from './biPlatformSnapshotService';

/** Fusionne audience live, analytics hub et snapshot BI dans le pack marketing. */
export async function fetchMarketingLiveContext() {
  const [presence, analytics, platform] = await Promise.all([
    fetchAdminLivePresence().catch(() => null),
    fetchAnalyticsHub().catch(() => null),
    loadBiPlatformSnapshot().catch(() => null),
  ]);

  const live = presence?.live || {};
  const totals = live.totals || {};
  const kpiSummary = analytics?.kpiSummary || {};

  return {
    audience: {
      onlineTotal: live.onlineTotal ?? 0,
      visitors: totals.visitor ?? 0,
      clients: totals.client ?? 0,
      vets: totals.vet ?? 0,
      vendors: totals.vendor ?? 0,
      sessions: (live.sessions || []).slice(0, 8),
      regions: (live.byRegion || live.regions || []).slice(0, 6),
      mode: presence ? 'live' : 'unavailable',
    },
    analytics: {
      revenue: kpiSummary.totalRevenue ?? kpiSummary.revenue ?? null,
      orders: kpiSummary.ordersCount ?? kpiSummary.orders ?? null,
      pendingOrders: kpiSummary.pendingOrders ?? null,
      mode: analytics ? 'live' : 'unavailable',
    },
    platform: platform
      ? {
          vetActiveCases: platform.vet?.activeCases,
          iotAlerts: platform.iot?.alerts,
          onlineUsers: platform.audience?.onlineTotal,
          topCategory: platform.commerce?.ordersToday,
        }
      : null,
  };
}

export function mergeMarketingLiveData(pack, liveContext) {
  if (!pack || !liveContext) return pack;

  const { audience, analytics, platform } = liveContext;
  const hasAudience = audience.mode === 'live' && audience.onlineTotal >= 0;

  const kpis = {
    ...pack.kpis,
    ...(hasAudience ? { onlineNow: audience.onlineTotal } : {}),
    ...(analytics.revenue != null ? { revenueLive: analytics.revenue } : {}),
    ...(analytics.orders != null ? { ordersLive: analytics.orders } : {}),
    ...(platform?.iotAlerts != null ? { iotAlertsLive: platform.iotAlerts } : {}),
  };

  const liveInsights = [];
  if (hasAudience && audience.onlineTotal > 0) {
    liveInsights.push({
      id: 'audience',
      type: 'audience',
      label: `${audience.onlineTotal} utilisateur(s) en ligne`,
      detail: `${audience.visitors} visiteurs · ${audience.clients} clients connectés`,
      route: '/admin/live-audience',
    });
  }
  if (platform?.vetActiveCases != null) {
    liveInsights.push({
      id: 'vet',
      type: 'bi',
      label: `${platform.vetActiveCases} cas vet actifs`,
      detail: 'Ciblage campagnes santé & rappels vaccins',
      route: '/admin/business-intelligence',
    });
  }
  if (platform?.iotAlerts != null && platform.iotAlerts > 0) {
    liveInsights.push({
      id: 'iot',
      type: 'iot',
      label: `${platform.iotAlerts} alerte(s) IoT`,
      detail: 'Push client — qualité alimentaire & distributeur',
      route: '/admin/iot-anomalies',
    });
  }
  if ((pack.campaigns || []).length > 0) {
    liveInsights.push({
      id: 'campaigns',
      type: 'campaign',
      label: `${pack.campaigns.length} campagne(s) IA suggérée(s)`,
      detail: pack.marketingSummary || 'Segmentation clients active',
      route: '/admin/digital-marketing',
    });
  }

  return {
    ...pack,
    kpis,
    audienceLive: audience,
    analyticsLive: analytics,
    platformSnapshot: platform,
    liveInsights,
    source: hasAudience || analytics.mode === 'live' ? 'hybrid' : pack.source,
  };
}
