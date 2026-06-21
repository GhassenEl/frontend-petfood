import api from '../utils/api';
import {
  buildContentProfile,
  runRecommendationPipeline,
} from '../utils/recommendationPipelineEngine';
import { DEMO_USER_INTERACTIONS } from '../utils/recommendationDemoData';
import { DEMO_ADMIN_TOP_PRODUCTS, DEMO_PRICE_GOVERNANCE_PACK } from '../utils/adminDemoData';
import { DEMO_VET_BI, DEMO_VET_PHARMACY_MEDS } from '../utils/vetDemoData';
import { DEMO_MODERATOR_PENDING_PRODUCTS, DEMO_MODERATOR_INAPPROPRIATE } from '../utils/moderatorDemoData';
import { DEMO_LIVREUR_ORDERS } from '../utils/livreurDemoData';

const mapProduct = (p) => ({
  id: String(p.id || p._id),
  name: p.name,
  category: p.category || 'produit',
  animalType: p.animalType,
  type: 'product',
  tags: p.tags || [],
  rating_avg: p.rating_avg || p.rating,
  popularity: p.popularity || p.stock || 0,
  price: p.price,
  product: p,
  description: p.description,
});

const CLIENT_CATALOG = () => [
  ...DEMO_PRICE_GOVERNANCE_PACK.products.map(mapProduct),
  mapProduct({ id: 'demo-prod-croq', name: 'Croquettes Premium Chien 12 kg', category: 'nourriture', animalType: 'dog', rating_avg: 4.6, popularity: 88, price: 54.9 }),
  mapProduct({ id: 'demo-prod-patee', name: 'Pâtée chat saumon 400 g', category: 'nourriture', animalType: 'cat', rating_avg: 4.4, popularity: 62, price: 21 }),
  mapProduct({ id: 'demo-prod-manteau', name: 'Manteau chien taille M', category: 'accessoire', animalType: 'dog', rating_avg: 4.2, popularity: 34, price: 34.6 }),
  mapProduct({ id: 'demo-prod-litiere-budget', name: 'Litière chat 5 L', category: 'hygiene', animalType: 'cat', rating_avg: 3.9, popularity: 45, price: 12 }),
  mapProduct({ id: 'svc-toilettage', name: 'Forfait toilettage premium', category: 'service', animalType: 'dog', tags: ['toilettage'], rating_avg: 4.7, popularity: 40, price: 45 }),
];

const VET_CATALOG = () => [
  ...DEMO_VET_PHARMACY_MEDS.slice(0, 6).map((m) => ({
    id: `med-${m.id || m.name}`,
    name: m.name || m.medication,
    category: 'medicament',
    type: 'clinical',
    tags: [m.pharmacy || 'clinique'],
    focus: (m.treatments || []).map((t) => t.disease).filter(Boolean),
    rating_avg: 4.5,
    popularity: m.stockQty || 10,
  })),
  ...(DEMO_VET_BI.diseaseByAnimal || []).slice(0, 4).map((d, i) => ({
    id: `proto-${i}`,
    name: `Protocole ${d.disease || d.name}`,
    category: 'protocole',
    type: 'clinical',
    tags: ['veterinaire'],
    focus: [d.disease || d.name],
    popularity: d.count || 5,
  })),
  { id: 'nut-hypo', name: 'Régime hypoallergénique saumon', category: 'nutrition', type: 'clinical', tags: ['nutrition'], focus: ['dermatite'], popularity: 20 },
  { id: 'med-shampoo', name: 'Shampoing dermatologique', category: 'medicament', type: 'clinical', focus: ['dermatite'], popularity: 18 },
  { id: 'med-anti-inflam', name: 'Anti-inflammatoire chien', category: 'medicament', type: 'clinical', focus: ['arthrose'], popularity: 22 },
  { id: 'med-vaccin-rage', name: 'Vaccin rage', category: 'vaccin', type: 'clinical', focus: ['prevention'], popularity: 30 },
  { id: 'med-antiparasitaire', name: 'Antiparasitaire spot-on', category: 'medicament', type: 'clinical', focus: ['parasites'], popularity: 25 },
];

const ADMIN_CATALOG = () => [
  ...DEMO_ADMIN_TOP_PRODUCTS.slice(0, 6).map((p) => ({
    id: p.id || p.name,
    name: p.name,
    category: p.category || 'produit',
    animalType: p.animalType,
    type: 'admin_action',
    tags: ['promotion'],
    popularity: p.sales || p.revenue || 50,
    price: p.price,
  })),
  ...DEMO_PRICE_GOVERNANCE_PACK.products.map((p) => ({
    ...mapProduct(p),
    type: 'admin_action',
    tags: [...(p.priceStatus === 'high_discount' ? ['pricing_alert'] : []), 'catalogue'],
  })),
  { id: 'vendor-ridha', name: 'Activer vendeur Ridha — Sfax', category: 'vendor', type: 'admin_action', tags: ['vendor'], popularity: 12 },
  { id: 'promo-anniv', name: 'Campagne anniversaire -15%', category: 'marketing', type: 'admin_action', tags: ['promo'], popularity: 80 },
];

const VENDOR_CATALOG = () => DEMO_PRICE_GOVERNANCE_PACK.products.map((p) => ({
  ...mapProduct(p),
  type: 'vendor_sku',
  tags: [...(p.stock < 25 ? ['stock_bas'] : []), 'catalogue'],
}));

const LIVREUR_CATALOG = () =>
  DEMO_LIVREUR_ORDERS.slice(0, 8).map((o) => ({
    id: String(o.id || o._id),
    name: `Livraison #${(o.id || o._id || '').slice(-4)} — ${o.city || o.address || 'Tunis'}`,
    category: o.status || 'en_cours',
    type: 'delivery',
    tags: [o.priority || 'normal', o.zone || 'tunis'],
    popularity: o.distanceKm ? 100 - o.distanceKm : 50,
    description: o.clientName || '',
  }));

const MODERATOR_CATALOG = () => [
  ...DEMO_MODERATOR_PENDING_PRODUCTS.map((p) => ({
    id: p.id,
    name: p.name || p.title,
    category: 'produit',
    type: 'moderation',
    tags: ['pending', p.reason || 'review'],
    popularity: 70,
  })),
  ...DEMO_MODERATOR_INAPPROPRIATE.map((c, i) => ({
    id: `mod-content-${i}`,
    name: c.subject || c.text?.slice(0, 40) || 'Contenu signalé',
    category: 'contenu',
    type: 'moderation',
    tags: ['inappropriate', c.type || 'comment'],
    popularity: 60,
  })),
];

const ROLE_CATALOG = {
  client: CLIENT_CATALOG,
  vet: VET_CATALOG,
  veterinarian: VET_CATALOG,
  admin: ADMIN_CATALOG,
  vendor: VENDOR_CATALOG,
  livreur: LIVREUR_CATALOG,
  moderator: MODERATOR_CATALOG,
};

const ROLE_USER_MAP = {
  client: 'client-demo',
  vet: 'vet-demo',
  veterinarian: 'vet-demo',
  admin: 'admin-demo',
  vendor: 'vendor-demo',
  livreur: 'livreur-demo',
  moderator: 'admin-demo',
};

async function fetchClientHistory(userId) {
  try {
    const [ordersRes, profileRes] = await Promise.allSettled([
      api.get('/orders/my'),
      api.get('/users/profile'),
    ]);
    const orders = ordersRes.status === 'fulfilled' ? ordersRes.value?.data : [];
    const profile = profileRes.status === 'fulfilled' ? profileRes.value?.data : {};
    const historyItemIds = (Array.isArray(orders) ? orders : orders?.orders || [])
      .flatMap((o) => (o.items || []).map((it) => String(it.productId?._id || it.productId?.id || it.productId || '')))
      .filter(Boolean);
    return buildContentProfile({
      userId,
      role: 'client',
      petType: profile.petType,
      categories: profile.favoriteCategories || [],
      preferences: profile.preferences || [],
      historyItemIds,
      favoriteCategories: profile.favoriteCategories || [],
    });
  } catch {
    return null;
  }
}

function demoProfileForRole(role, userId) {
  const interaction = DEMO_USER_INTERACTIONS.find((u) => u.userId === userId)
    || DEMO_USER_INTERACTIONS.find((u) => u.userId.startsWith(role.split('_')[0]))
    || DEMO_USER_INTERACTIONS[0];

  return buildContentProfile({
    userId,
    role,
    petType: interaction.petType,
    categories: interaction.categories || [],
    tags: interaction.tags || [],
    historyItemIds: interaction.itemIds || [],
    focus: interaction.focus || [],
  });
}

/** Charge et exécute le pipeline de recommandation pour un acteur */
export async function loadRecommendationPipeline(role = 'client', userId) {
  const normalizedRole = role === 'veterinarian' ? 'vet' : role;
  const uid = userId || ROLE_USER_MAP[normalizedRole] || 'client-demo';
  const catalogFn = ROLE_CATALOG[normalizedRole] || CLIENT_CATALOG;
  const items = catalogFn();

  let profile = demoProfileForRole(normalizedRole, uid);
  if (normalizedRole === 'client') {
    const live = await fetchClientHistory(uid);
    if (live) profile = { ...profile, ...live, historyItemIds: [...new Set([...(profile.historyItemIds || []), ...(live.historyItemIds || [])])] };
  }

  const result = runRecommendationPipeline({
    role: normalizedRole,
    userId: uid,
    items,
    profile,
    interactions: DEMO_USER_INTERACTIONS,
    limit: 10,
  });

  return { ...result, mode: profile.historyItemIds?.length ? 'hybrid' : 'demo' };
}

/** Fusionne les recommandations pipeline avec le catalogue boutique (match par id) */
export function enrichRecommendationsWithCatalog(recommendations = [], catalog = []) {
  if (!catalog.length) return recommendations;

  const byId = new Map();
  catalog.forEach((p) => {
    const id = String(p._id || p.id);
    byId.set(id, p);
  });

  return recommendations.map((rec) => {
    const product = byId.get(String(rec.id));
    if (!product) return rec;
    return {
      ...product,
      id: rec.id,
      hybridScore: rec.hybridScore,
      contentScore: rec.contentScore,
      collaborativeScore: rec.collaborativeScore,
      reasons: rec.reasons,
      recommendedReason: rec.recommendedReason,
    };
  });
}

export default { loadRecommendationPipeline, enrichRecommendationsWithCatalog };
