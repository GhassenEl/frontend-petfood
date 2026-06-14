/** Service visiteur — catalogue public sans authentification. */

import api from '../utils/api';
import { getProducts } from './productService';
import {
  VISITOR_PUBLIC_PRODUCTS,
  VISITOR_PRODUCT_PACKS,
  getVisitorDemoStore,
} from '../utils/visitorDemoData';
import { resolveNaturalProductImage } from '../utils/productImages';

const normalize = (p) => {
  if (!p) return p;
  const discount = Number(p.discount ?? p.promotionPercent ?? 0);
  return {
    ...p,
    id: p.id || p._id,
    _id: p._id || p.id,
    price: Number(p.price ?? 0),
    stock: Number(p.stock ?? p.quantity ?? 0),
    discount,
    promotionPercent: discount,
    imageUrl: resolveNaturalProductImage({ ...p, imageUrl: p.imageUrl ?? p.image }),
  };
};

export async function fetchVisitorProducts() {
  try {
    const list = await getProducts();
    if (Array.isArray(list) && list.length > 0) {
      return { data: list.map(normalize), demo: false };
    }
  } catch {
    /* fallback démo */
  }
  const store = getVisitorDemoStore();
  return { data: store.products.map(normalize), demo: true };
}

export async function fetchVisitorProductById(id) {
  const { data } = await fetchVisitorProducts();
  return data.find((p) => String(p.id) === String(id) || String(p._id) === String(id)) || null;
}

export async function fetchVisitorReviewRecommendations(params = {}) {
  try {
    const { data } = await api.get('/ai/recommendations/public', { params });
    if (data?.recommendations?.length) {
      return { data: data.recommendations, summary: data.summary, demo: false };
    }
  } catch {
    /* fallback catalogue */
  }
  const { data: products } = await fetchVisitorProducts();
  const sorted = [...(products || [])]
    .sort((a, b) => (b.rating_avg || 0) - (a.rating_avg || 0))
    .slice(0, params.limit || 8)
    .map((p) => ({
      ...p,
      recommendedReason: `⭐ ${(p.rating_avg || 0).toFixed(1)}/5 — ${p.description?.slice(0, 60) || p.name}`,
    }));
  return { data: sorted, summary: 'Classement par note moyenne (mode démo)', demo: true };
}

export async function fetchVisitorPacks(params = {}) {
  try {
    const { fetchProductPacks } = await import('./ecosystemService');
    const data = await fetchProductPacks(params);
    if (data?.packs?.length) return { data, demo: false };
  } catch {
    /* fallback */
  }
  let packs = [...VISITOR_PRODUCT_PACKS];
  const type = params?.petType || params?.animalType;
  if (type) {
    packs = packs.filter((pk) => !pk.forTypes?.length || pk.forTypes.includes(type));
  }
  return {
    data: { packs, suggestedPackType: packs[0]?.type || null },
    demo: true,
  };
}
