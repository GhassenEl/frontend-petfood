import api from '../utils/api';
import { getProducts } from './productService';
import {
  DEMO_ADMIN_ORDERS,
  DEMO_ADMIN_SALES_KPI,
  buildDemoRevenueChart,
} from '../utils/adminDemoData';
import { DEMO_REVIEWS, withDemoFallback } from '../utils/clientDemoData';
import { forecastSalesMl } from '../utils/analyticsDecisionEngine';
import { predictStockOutages } from '../utils/predictiveStockEngine';
import { optimizeProductPrices } from '../utils/priceOptimizationEngine';
import { generateBatchDescriptions } from '../utils/productDescriptionGenerator';
import { analyzeProductReviews, filterReviewsByProduct } from '../utils/reviewInsightAnalyzer';
import { generateMarketingRecommendations } from '../utils/marketingRecommendationEngine';
import { detectMarketTrends } from '../utils/marketTrendDetector';

export async function loadMerchantIntelligencePack() {
  const [ordersRes, reviewsRes, productsRes, usersRes] = await Promise.all([
    api.get('/orders').catch(() => ({ data: [] })),
    api.get('/reviews').catch(() => ({ data: [] })),
    getProducts().catch(() => []),
    api.get('/users').catch(() => ({ data: [] })),
  ]);

  const orders = withDemoFallback(ordersRes.data, DEMO_ADMIN_ORDERS);
  const reviews = withDemoFallback(reviewsRes.data, DEMO_REVIEWS);
  const products = Array.isArray(productsRes) ? productsRes : [];
  const users = usersRes.data || [];

  const salesChart = buildDemoRevenueChart(orders);
  const salesForecast = forecastSalesMl(salesChart.map((m) => ({ revenue: m.value })), 4);

  const stockAlerts = predictStockOutages({
    stockItems: products.map((p) => ({
      id: p.id || p._id,
      name: p.name,
      stock: p.stock,
      minStock: p.minStock ?? 10,
      category: p.category,
    })),
    orders,
  });

  const marketTrends = detectMarketTrends({ orders, products });
  const priceOptimizations = optimizeProductPrices({
    products,
    orders,
    marketTrends: marketTrends.trends,
  });

  const descriptions = generateBatchDescriptions(products.slice(0, 8));

  const reviewAnalysis = products.slice(0, 12).map((p) => {
    const pid = String(p.id || p._id);
    const productReviews = filterReviewsByProduct(reviews, pid);
    const insight = analyzeProductReviews(productReviews);
    return {
      productId: pid,
      productName: p.name,
      insight,
      reviewCount: productReviews.length,
    };
  }).filter((r) => r.insight);

  const marketing = generateMarketingRecommendations({ orders, users, products });

  return {
    salesForecast,
    salesChart,
    stockAlerts,
    priceOptimizations: priceOptimizations.slice(0, 15),
    descriptions,
    reviewAnalysis,
    marketing,
    kpi: DEMO_ADMIN_SALES_KPI,
  };
}

export default loadMerchantIntelligencePack;
