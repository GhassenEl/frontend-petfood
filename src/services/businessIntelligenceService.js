import api from '../utils/api';
import {
  DEMO_ADMIN_ORDERS,
  DEMO_ADMIN_USERS,
  DEMO_ADMIN_STOCK,
  withDemoFallback,
} from '../utils/adminDemoData';
import { segmentClientsByPurchases } from '../utils/clientSegmentationEngine';
import { detectMarketTrends } from '../utils/marketTrendDetector';
import { predictStockOutages } from '../utils/predictiveStockEngine';
import { loadBiPlatformSnapshot } from './biPlatformSnapshotService';

export async function loadBusinessIntelligencePack() {
  const [ordersRes, usersRes, stockRes, platform] = await Promise.all([
    api.get('/orders').catch(() => ({ data: [] })),
    api.get('/users').catch(() => ({ data: [] })),
    api.get('/admin/stock').catch(() => ({ data: [] })),
    loadBiPlatformSnapshot().catch(() => null),
  ]);

  const orders = withDemoFallback(ordersRes.data, DEMO_ADMIN_ORDERS);
  const users = withDemoFallback(usersRes.data, DEMO_ADMIN_USERS);
  const stockItems = withDemoFallback(stockRes.data, DEMO_ADMIN_STOCK);

  const segmentation = segmentClientsByPurchases({ orders, users });
  const marketTrends = detectMarketTrends({ orders });
  const stockPredictions = predictStockOutages({ stockItems, orders });

  return {
    orders,
    segmentation,
    marketTrends,
    stockPredictions,
    platform,
    kpi: {
      clientSegments: segmentation.segments?.length || 0,
      atRiskStock: stockPredictions.filter((p) => p.urgency === 'critical' || p.urgency === 'high').length,
      topCategory: marketTrends.topCategories?.[0]?.label || '—',
      onlineUsers: platform?.audience?.onlineTotal ?? null,
      vetActiveCases: platform?.vet?.activeCases ?? null,
      iotAlerts: platform?.iot?.alerts ?? null,
    },
  };
}

export default loadBusinessIntelligencePack;
