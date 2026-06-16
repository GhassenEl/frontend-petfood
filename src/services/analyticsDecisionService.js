import api from '../utils/api';
import {
  DEMO_ADMIN_ORDERS,
  DEMO_ADMIN_SALES_KPI,
  DEMO_ADMIN_TOP_PRODUCTS,
  buildDemoRevenueChart,
} from '../utils/adminDemoData';
import { DEMO_REVIEWS, withDemoFallback } from '../utils/clientDemoData';
import {
  buildAnalyticsDashboard,
  detectAtRiskProducts,
  forecastSalesMl,
} from '../utils/analyticsDecisionEngine';
import { getProducts } from './productService';

export async function loadAnalyticsDecisionPack() {
  const [ordersRes, reviewsRes, products] = await Promise.all([
    api.get('/orders').catch(() => ({ data: [] })),
    api.get('/reviews').catch(() => ({ data: [] })),
    getProducts().catch(() => []),
  ]);

  const orders = withDemoFallback(ordersRes.data, DEMO_ADMIN_ORDERS);
  const reviews = withDemoFallback(reviewsRes.data, DEMO_REVIEWS);
  const productsList = Array.isArray(products) ? products : [];

  const salesChart = buildDemoRevenueChart(orders);
  const dashboard = buildAnalyticsDashboard({
    orders,
    reviews,
    products: productsList,
  });

  const salesForecast = forecastSalesMl(
    salesChart.map((m) => ({ revenue: m.value })),
    4,
  );

  const atRiskProducts = detectAtRiskProducts({
    reviews,
    products: productsList,
  });

  return {
    orders,
    reviews,
    dashboard,
    salesChart,
    salesForecast,
    atRiskProducts,
    kpiFallback: DEMO_ADMIN_SALES_KPI,
    topProductsFallback: DEMO_ADMIN_TOP_PRODUCTS,
  };
}

export default loadAnalyticsDecisionPack;
