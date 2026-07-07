import { fetchVendorCatalog } from './vendorService';
import { fetchVendorMlAgent } from './ecosystemService';
import { DEMO_VENDOR_DASHBOARD } from '../utils/vendorDemoData';
import { DEMO_REVIEWS, withDemoFallback } from '../utils/clientDemoData';
import { suggestVendorPromotions } from '../utils/vendorPromoAssistantEngine';
import { detectHighPotentialProducts } from '../utils/productPotentialEngine';
import { allowDemoFallback } from '../config/liveDataPolicy';
import api from '../utils/api';

const buildDemoSalesForecast = () => {
  const revenues = [280, 310, 245, 390, 420, 355, 410];
  const now = new Date();
  return revenues.map((revenue, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    return {
      label: d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
      revenue,
      value: revenue,
      day: d.toISOString(),
    };
  });
};

const buildDemoMlPack = () => {
  const ml = DEMO_VENDOR_DASHBOARD.mlAgent || {};
  const salesForecast = buildDemoSalesForecast();
  return {
    ...ml,
    groqPowered: true,
    pythonPowered: true,
    mlPowered: true,
    salesForecast,
    revenueForecast7d: salesForecast.reduce((sum, d) => sum + (d.revenue || 0), 0),
    stockAlerts: ml.stockAlerts || [],
    priceSuggestions: [
      { productId: 'vp2', productName: 'Pâtée chat saumon', suggestedChange: '-5 %', reason: 'Concurrence saisonnière — volume stable' },
      { productId: 'vp5', productName: 'Fontaine eau chat 2 L', suggestedChange: '+8 %', reason: 'Forte demande avant l\'été' },
      { productId: 'vp3', productName: 'Litière agglomérante 10 L', suggestedChange: 'Bundle -12 %', reason: 'Rupture récurrente — écouler le stock restant' },
    ],
    lowPerformers: [
      { productId: 'vp4', productName: 'Jouet corde résistant', unitsSold: 3, action: 'Proposer en bundle avec croquettes chien' },
    ],
    demandAnomalies: [
      { productName: 'Fontaine eau chat 2 L', changePct: 34, direction: 'up', note: 'Pic inhabituel sur 7 jours' },
    ],
    riskScore: 42,
  };
};

const pickNonEmpty = (live, demo) => (Array.isArray(live) && live.length > 0 ? live : demo);

export async function loadVendorIntelligencePack() {
  let apiData = null;
  try {
    apiData = await fetchVendorMlAgent();
  } catch {
    /* fallback local */
  }

  const demoMl = buildDemoMlPack();
  const useDemo = allowDemoFallback() && (!apiData || !apiData.salesForecast?.length);

  const catalogRes = await fetchVendorCatalog();
  const products = catalogRes.data?.products || DEMO_VENDOR_DASHBOARD.catalogProducts || [];

  let orders = [];
  try {
    const res = await api.get('/orders').catch(() => ({ data: [] }));
    orders = res.data || [];
  } catch {
    orders = [];
  }

  let reviews = DEMO_REVIEWS;
  try {
    const res = await api.get('/reviews').catch(() => ({ data: [] }));
    reviews = withDemoFallback(res.data, DEMO_REVIEWS);
  } catch {
    /* démo */
  }

  const promoSuggestions = suggestVendorPromotions({ products, orders });
  const highPotentialProducts = detectHighPotentialProducts({ products, orders, reviews });

  const merged = {
    ...(useDemo ? demoMl : {}),
    ...(apiData || {}),
    promoSuggestions: pickNonEmpty(apiData?.promoSuggestions, promoSuggestions),
    highPotentialProducts: highPotentialProducts.length
      ? highPotentialProducts
      : pickNonEmpty(apiData?.highPotentialProducts, []),
    localPromoSuggestions: promoSuggestions,
    localHighPotential: highPotentialProducts,
    salesForecast: pickNonEmpty(apiData?.salesForecast, demoMl.salesForecast),
    priceSuggestions: pickNonEmpty(apiData?.priceSuggestions, demoMl.priceSuggestions),
    lowPerformers: pickNonEmpty(apiData?.lowPerformers, demoMl.lowPerformers),
    demandAnomalies: pickNonEmpty(apiData?.demandAnomalies, demoMl.demandAnomalies),
    stockAlerts: pickNonEmpty(apiData?.stockAlerts || apiData?.alerts, demoMl.stockAlerts),
    revenueForecast7d: apiData?.revenueForecast7d ?? demoMl.revenueForecast7d,
    riskScore: apiData?.riskScore ?? demoMl.riskScore,
    mlPowered: Boolean(apiData?.mlPowered || promoSuggestions.length || useDemo),
    summary:
      apiData?.summary ||
      demoMl.summary ||
      `Assistant IA : ${promoSuggestions.length} promo(s) suggérée(s), ${highPotentialProducts.length} produit(s) à fort potentiel.`,
  };

  return merged;
}

export default loadVendorIntelligencePack;
