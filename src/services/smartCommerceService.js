import api from '../utils/api';
import { getProducts } from './productService';
import { getFrequentProducts } from './favoriteService';
import { fetchSubscriptions } from './ecosystemService';
import { compareProducts } from './ecosystemService';
import { suggestComplementaryProducts } from '../utils/complementaryProducts';
import { buildReplenishmentPlan } from '../utils/smartReplenishment';
import { compareProductsSmart } from '../utils/productComparator';
import { DEMO_ORDERS, DEMO_SUBSCRIPTIONS, DEMO_REVIEWS } from '../utils/clientDemoData';

const buildDemoCatalog = (orders = [], subscriptions = []) => {
  const map = new Map();
  const push = (p) => {
    if (!p?.name) return;
    const id = String(p.id || p._id || p.name);
    if (map.has(id)) return;
    map.set(id, {
      id,
      _id: id,
      name: p.name,
      price: p.price ?? 0,
      category: p.category || 'nourriture',
      animalType: p.animalType || 'dog',
      rating_avg: 4.2,
      rating_count: 12,
      stock: 50,
      description: p.description || '',
      composition: p.composition || 'Protéines 26%, graisses 14%, fibres 3%.',
    });
  };

  (orders || []).forEach((order) => {
    (order.items || []).forEach((item) => {
      const p = item.productId || item.product;
      if (typeof p === 'object') push(p);
    });
  });

  (subscriptions || []).forEach((sub) => {
    push(sub.product || { id: sub.productId, name: 'Abonnement', price: 0 });
  });

  const extras = [
    { id: 'demo-prod-patee', name: 'Pâtée chat saumon 400 g', price: 21, category: 'nourriture', animalType: 'cat' },
    { id: 'demo-prod-friandise', name: 'Friandises dentaires chien', price: 18.5, category: 'friandise', animalType: 'dog' },
    { id: 'demo-prod-shampoing', name: 'Shampoing doux chien hypoallergénique', price: 24, category: 'hygiene', animalType: 'dog' },
    { id: 'demo-prod-litiere', name: 'Litière agglomérante chat 10 L', price: 32, category: 'hygiene', animalType: 'cat' },
    { id: 'demo-prod-jouet', name: 'Jouet distributeur friandises', price: 45, category: 'jouet', animalType: 'dog' },
  ];
  extras.forEach(push);

  return [...map.values()];
};

export async function loadSmartCommerceData() {
  const [products, ordersRes, subsRes, frequent] = await Promise.all([
    getProducts().catch(() => []),
    api.get('/orders').catch(() => ({ data: DEMO_ORDERS })),
    fetchSubscriptions().catch(() => ({ subscriptions: DEMO_SUBSCRIPTIONS })),
    getFrequentProducts(12).catch(() => []),
  ]);

  const orders = (ordersRes.data?.length ? ordersRes.data : DEMO_ORDERS) || [];
  const subscriptions = subsRes?.subscriptions?.length ? subsRes.subscriptions : DEMO_SUBSCRIPTIONS;

  let productsList = Array.isArray(products) ? products : [];
  if (!productsList.length) {
    productsList = buildDemoCatalog(orders, subscriptions);
  }

  const purchasedProducts = [];
  const purchasedIds = new Set();

  orders.forEach((order) => {
    (order.items || []).forEach((item) => {
      const p = item.productId || item.product;
      const id = typeof p === 'object' ? p.id || p._id : p;
      const catalog = productsList.find((x) => String(x.id || x._id) === String(id));
      const prod = catalog || (typeof p === 'object' ? p : { id, name: item.name });
      const pid = String(prod.id || prod._id || prod.name);
      if (!purchasedIds.has(pid)) {
        purchasedIds.add(pid);
        purchasedProducts.push(prod);
      }
    });
  });

  (frequent || []).forEach((p) => {
    const pid = String(p.id || p._id);
    if (!purchasedIds.has(pid)) {
      purchasedIds.add(pid);
      purchasedProducts.push(p);
    }
  });

  const complementary = suggestComplementaryProducts({
    purchased: purchasedProducts,
    catalog: productsList,
    limit: 8,
  });

  const replenishment = buildReplenishmentPlan({
    orders,
    products: productsList,
    subscriptions,
  });

  return {
    products: productsList,
    purchasedProducts,
    complementary,
    replenishment,
    orders,
    subscriptions,
  };
}

export async function runSmartCompare(productIds) {
  let catalog = (await getProducts().catch(() => [])) || [];
  if (!catalog.length) {
    catalog = buildDemoCatalog(DEMO_ORDERS, DEMO_SUBSCRIPTIONS);
  }

  const products = catalog.filter((p) => productIds.includes(String(p.id || p._id)));

  if (products.length < 2) {
    throw new Error('Produits introuvables pour la comparaison');
  }

  const reviewsByProductId = {};
  await Promise.all(
    productIds.map(async (id) => {
      const fromApi = await getProductReviews(id).catch(() => []);
      if (fromApi.length) {
        reviewsByProductId[id] = fromApi;
        return;
      }
      reviewsByProductId[id] = (DEMO_REVIEWS || []).filter(
        (r) => String(r.productId?._id || r.productId?.id || '') === String(id),
      );
    }),
  );

  const local = compareProductsSmart(products, reviewsByProductId);
  if (local?.products?.length >= 2) return local;

  try {
    const data = await compareProducts(productIds);
    if (data?.products?.length >= 2) return data;
  } catch {
    /* API indisponible */
  }

  return local;
}

export default loadSmartCommerceData;
