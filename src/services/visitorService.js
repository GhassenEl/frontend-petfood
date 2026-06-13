/** Service visiteur — catalogue public sans authentification. */

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
