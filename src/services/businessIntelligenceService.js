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

export async function loadBusinessIntelligencePack() {
  const [ordersRes, usersRes, stockRes] = await Promise.all([
    api.get('/orders').catch(() => ({ data: [] })),
    api.get('/users').catch(() => ({ data: [] })),
    api.get('/admin/stock').catch(() => ({ data: [] })),
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
    kpi: {
      clientSegments: segmentation.segments?.length || 0,
      atRiskStock: stockPredictions.filter((p) => p.urgency === 'critical' || p.urgency === 'high').length,
      topCategory: marketTrends.topCategories?.[0]?.label || '—',
    },
  };
}

export default loadBusinessIntelligencePack;
