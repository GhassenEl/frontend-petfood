import { CARBON_DELIVERY_STATS } from '../config/isoSustainabilityCatalog';
import {
  RSE_PILLARS,
  NATURE_INITIATIVES,
  ECOLOGY_ACTIONS,
  ECO_PRODUCT_LABELS,
  ECO_PLEDGES,
  RSE_TIMELINE,
} from '../config/rseEcologyCatalog';
import { ENVIRONMENTAL_COMMITMENTS } from '../config/platformComplianceCatalog';

const ECO_KEYWORDS = {
  bio: /bio|organic|biologique|naturel/i,
  local: /local|tunis|tn\b|made in tunisia|artisanal/i,
  recyclable: /recycl|carton|papier|eco.?pack|fsc/i,
  'low-carbon': /bas carbone|low.?carbon|eco|vert|green/i,
  'cruelty-free': /cruelty|sans test|éthique|ethical/i,
  'refuge-donation': /refuge|don|association|solidar/i,
};

/** Score RSE global plateforme (0–100). */
export const computePlatformRseScore = () => {
  const fixed = [88, 91, 85, 87];
  const overall = Math.round(fixed.reduce((a, b) => a + b, 0) / fixed.length);
  return {
    overall,
    pillars: RSE_PILLARS.map((p, i) => ({ id: p.id, score: fixed[i], label: p.label, color: p.color })),
    carbon: CARBON_DELIVERY_STATS,
    commitments: ENVIRONMENTAL_COMMITMENTS,
    initiatives: NATURE_INITIATIVES.filter((n) => n.status === 'actif').length,
    timeline: RSE_TIMELINE,
  };
};

/** Labels éco d'un produit (heuristique nom + catégorie). */
export const getProductEcoLabels = (product = {}) => {
  const text = `${product.name || ''} ${product.category || ''} ${product.description || ''} ${product.brand || ''}`;
  const labels = ECO_PRODUCT_LABELS.filter((l) => ECO_KEYWORDS[l.id]?.test(text));
  if (labels.length === 0 && product.animalType) {
    if (/premium|quality|qualité/i.test(text)) {
      labels.push(ECO_PRODUCT_LABELS.find((l) => l.id === 'cruelty-free'));
    }
  }
  if (product.ecoScore >= 70) {
    const lowCarbon = ECO_PRODUCT_LABELS.find((l) => l.id === 'low-carbon');
    if (!labels.find((l) => l.id === 'low-carbon')) labels.push(lowCarbon);
  }
  return labels.filter(Boolean).slice(0, 3);
};

/** Score éco produit 0–100. */
export const computeProductEcoScore = (product = {}) => {
  const labels = getProductEcoLabels(product);
  let score = 40 + labels.length * 12;
  if (/bio/i.test(product.name || '')) score += 15;
  if (/local|tunis/i.test(product.name || '')) score += 10;
  if (product.packaging === 'recyclable') score += 8;
  return Math.min(100, Math.round(score));
};

/** Impact personnel client basé sur commandes et engagements. */
export const computeClientEcoImpact = (orders = [], pledges = []) => {
  const orderCount = orders.length || 12;
  const co2PerOrder = CARBON_DELIVERY_STATS.avgPerDelivery;
  const co2Total = +(orderCount * co2PerOrder).toFixed(1);
  const pledgeSaving = pledges.reduce((s, id) => {
    const p = ECO_PLEDGES.find((x) => x.id === id);
    return s + (p?.co2Saved || 0);
  }, 0);
  const co2Saved = +(orderCount * pledgeSaving * 0.3).toFixed(1);
  const treesContributed = Math.floor(orderCount / 50);
  const wasteAvoided = Math.round(orderCount * 0.08 * 10) / 10;

  return {
    orderCount,
    co2Total,
    co2Saved,
    co2Net: +(co2Total - co2Saved).toFixed(1),
    treesContributed,
    wasteAvoidedKg: wasteAvoided,
    pledgesActive: pledges.length,
    ecoScore: Math.min(100, 50 + pledges.length * 10 + treesContributed * 2),
    rank: pledges.length >= 3 ? 'Éco-ambassadeur' : pledges.length >= 1 ? 'Engagé' : 'Découvreur',
  };
};

/** Tableau de bord vendeur RSE. */
export const computeVendorEcoDashboard = () => ({
  ecoProductsPct: 68,
  recyclablePackagingPct: 74,
  localSourcingPct: 55,
  carbonPerShipment: 0.45,
  wasteReducedKg: 186,
  certifications: ['FSC Emballages', 'Bio Tunisie', 'Circuit court'],
  actions: ECOLOGY_ACTIONS.slice(0, 3),
});

/** Tableau de bord livreur vert. */
export const computeLivreurEcoDashboard = () => ({
  ...CARBON_DELIVERY_STATS,
  personalDeliveries: 342,
  personalCo2Kg: 281,
  personalSavedKg: 58,
  ecoRoutesPct: 72,
  greenTips: [
    'Regrouper les colis du même quartier',
    'Privilégier les créneaux hors pointe',
    'Vérifier la chaîne du froid pour limiter le gaspillage',
    'Signaler les points de collecte recyclage sur la tournée',
  ],
});

/** Pack complet hub RSE par rôle. */
export const buildRseEcologyPack = (role = 'public', context = {}) => {
  const platform = computePlatformRseScore();
  const pack = {
    role,
    platform,
    pillars: RSE_PILLARS,
    nature: NATURE_INITIATIVES,
    ecology: ECOLOGY_ACTIONS,
    pledges: ECO_PLEDGES,
    timeline: RSE_TIMELINE,
    commitments: ENVIRONMENTAL_COMMITMENTS,
  };

  if (role === 'client') {
    pack.clientImpact = computeClientEcoImpact(context.orders || [], context.pledges || []);
  }
  if (role === 'vendor') {
    pack.vendor = computeVendorEcoDashboard();
  }
  if (role === 'livreur') {
    pack.livreur = computeLivreurEcoDashboard();
  }

  return pack;
};

export default {
  computePlatformRseScore,
  getProductEcoLabels,
  computeProductEcoScore,
  computeClientEcoImpact,
  computeVendorEcoDashboard,
  computeLivreurEcoDashboard,
  buildRseEcologyPack,
};
