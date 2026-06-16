import { fetchVendorCatalog } from './vendorService';
import { fetchVendorMlAgent } from './ecosystemService';
import { DEMO_VENDOR_DASHBOARD } from '../utils/vendorDemoData';
import { DEMO_REVIEWS, withDemoFallback } from '../utils/clientDemoData';
import { suggestVendorPromotions } from '../utils/vendorPromoAssistantEngine';
import { detectHighPotentialProducts } from '../utils/productPotentialEngine';
import api from '../utils/api';

export async function loadVendorIntelligencePack() {
  let apiData = null;
  try {
    apiData = await fetchVendorMlAgent();
  } catch {
    /* fallback local */
  }

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

  return {
    ...apiData,
    promoSuggestions: apiData?.promoSuggestions?.length
      ? apiData.promoSuggestions
      : promoSuggestions,
    highPotentialProducts: highPotentialProducts.length
      ? highPotentialProducts
      : (apiData?.highPotentialProducts || []),
    localPromoSuggestions: promoSuggestions,
    localHighPotential: highPotentialProducts,
    mlPowered: Boolean(apiData?.mlPowered || promoSuggestions.length),
    summary:
      apiData?.summary ||
      `Assistant IA : ${promoSuggestions.length} promo(s) suggérée(s), ${highPotentialProducts.length} produit(s) à fort potentiel.`,
  };
}

export default loadVendorIntelligencePack;
