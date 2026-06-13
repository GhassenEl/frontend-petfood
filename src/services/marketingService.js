import api from '../utils/api';
import {
  MARKETING_TESTIMONIALS,
  MARKETING_PARTNERS,
} from '../config/marketingContent';
import {
  DEMO_SERVICE_RATINGS,
  DEMO_REVIEWS,
  SERVICE_RATE_CARDS,
} from '../utils/clientDemoData';
import { DEMO_ADMIN_REVIEWS, DEMO_ADMIN_VENDORS } from '../utils/adminDemoData';

const PUBLIC_OPTS = { _publicMarketing: true };

const SERVICE_LABELS = Object.fromEntries(
  SERVICE_RATE_CARDS.map((c) => [c.type, c.label]),
);

const SERVICE_EMOJI = {
  grooming: '✂️',
  bathing: '🛁',
  nail_trim: '💅',
  dental_cleaning: '🦷',
  wellness_pack: '✨',
  home_sitting: '🏡',
  boarding: '🏠',
  training: '🎓',
  veterinary: '🩺',
  rehabilitation: '💚',
  daycare: '🌞',
  delivery: '🚚',
};

const EMOTION_EMOJI = {
  happy: '😊',
  satisfied: '🙂',
  neutral: '😐',
  disappointed: '😕',
};

const formatDT = (n) =>
  Number(n || 0).toLocaleString('fr-TN', { maximumFractionDigits: 0 });

const pickDemoName = (index) =>
  MARKETING_TESTIMONIALS[index % MARKETING_TESTIMONIALS.length]?.name || 'Client PetfoodTN';

const pickDemoCity = (index) =>
  MARKETING_TESTIMONIALS[index % MARKETING_TESTIMONIALS.length]?.city?.split('·')[0]?.trim()
  || 'Tunisie';

export const mapServiceRatingToTestimonial = (rating, index = 0) => ({
  id: rating.id || rating._id || `sr-${index}`,
  name: rating.user?.name || rating.userName || rating.authorName || pickDemoName(index),
  city: rating.region || rating.city || rating.user?.region || pickDemoCity(index),
  pet: rating.petName
    ? rating.petName
    : rating.animalType
      ? `Animal · ${rating.animalType}`
      : 'Client fidèle',
  petEmoji: SERVICE_EMOJI[rating.type] || '🐾',
  rating: Math.min(5, Math.max(1, Number(rating.rating) || 5)),
  service: SERVICE_LABELS[rating.type] || rating.type || 'Service PetfoodTN',
  quote: rating.comment || rating.text || '',
  source: 'service-rating',
});

export const mapProductReviewToTestimonial = (review, index = 0) => {
  const productName =
    review.productId?.name || review.product?.name || review.productName || 'Produit';
  return {
    id: review.id || review._id || `rev-${index}`,
    name: review.user?.name || review.userName || pickDemoName(index + 2),
    city: review.user?.region || pickDemoCity(index + 1),
    pet: productName,
    petEmoji: EMOTION_EMOJI[review.emotion] || '⭐',
    rating: Math.min(5, Math.max(1, Number(review.rating) || 5)),
    service: `Boutique · ${productName}`,
    quote: review.comment || review.text || '',
    source: 'review',
  };
};

export const mapVendorToPartner = (vendor) => ({
  id: vendor.id || vendor._id,
  name: vendor.shopName || vendor.name || 'Fournisseur',
  type: 'Fournisseur marketplace',
  city: vendor.region || 'Tunisie',
  icon: '🏬',
  description: [
    vendor.productsCount != null ? `${vendor.productsCount} produits` : null,
    vendor.revenue30d != null ? `CA 30j : ${formatDT(vendor.revenue30d)} DT` : null,
    vendor.rank != null ? `Rang #${vendor.rank}` : null,
  ].filter(Boolean).join(' · ') || 'Partenaire certifié PetfoodTN.',
  status: vendor.status || 'active',
  source: 'marketplace',
  badge: 'Certifié',
});

export const mapCommunityPartner = (p) => ({
  ...p,
  source: 'community',
  badge: null,
});

const buildDemoTestimonials = () => {
  const fromServices = DEMO_SERVICE_RATINGS.filter((r) => r.comment).map(mapServiceRatingToTestimonial);
  const fromReviews = DEMO_ADMIN_REVIEWS.filter((r) => r.comment).map(mapProductReviewToTestimonial);
  const merged = [...fromServices, ...fromReviews];
  if (merged.length >= 4) return merged;
  return MARKETING_TESTIMONIALS.map((t) => ({ ...t, source: 'static' }));
};

const computeAverageRating = (items) => {
  if (!items.length) return { average: 4.9, count: 0 };
  const sum = items.reduce((a, t) => a + (t.rating || 5), 0);
  return {
    average: Math.round((sum / items.length) * 10) / 10,
    count: items.length,
  };
};

/**
 * Avis clients : notes services + avis produits (API publique, fallback démo).
 */
export const fetchMarketingTestimonials = async ({ limit = 6 } = {}) => {
  let items = [];
  let source = 'demo';

  try {
    const [srRes, revRes] = await Promise.all([
      api.get('/service-ratings', PUBLIC_OPTS).then((r) => r.data).catch(() => null),
      api.get('/reviews', PUBLIC_OPTS).then((r) => r.data).catch(() => null),
    ]);

    const serviceRatings = Array.isArray(srRes) ? srRes : srRes?.ratings || [];
    const reviews = Array.isArray(revRes) ? revRes : revRes?.reviews || [];

    const fromApi = [
      ...serviceRatings
        .filter((r) => r.comment?.trim())
        .map(mapServiceRatingToTestimonial),
      ...reviews
        .filter((r) => r.comment?.trim())
        .map(mapProductReviewToTestimonial),
    ];

    if (fromApi.length) {
      items = fromApi;
      source = 'api';
    }
  } catch {
    /* fallback below */
  }

  if (!items.length) {
    items = buildDemoTestimonials();
    source = items.some((i) => i.source === 'static') ? 'static' : 'demo';
  }

  items = items
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, limit);

  const stats = computeAverageRating(items);

  return {
    testimonials: items,
    stats,
    source,
  };
};

/**
 * Partenaires : fournisseurs marketplace actifs (API) + réseau communautaire (refuges, véto…).
 */
export const fetchMarketingPartners = async () => {
  let vendors = [];
  let vendorSource = 'demo';

  try {
    const marketplace = await api
      .get('/ecosystem/marketplace', PUBLIC_OPTS)
      .then((r) => r.data)
      .catch(() => null);
    const list = marketplace?.vendors || marketplace || [];
    vendors = (Array.isArray(list) ? list : [])
      .filter((v) => (v.status || 'active') === 'active')
      .map(mapVendorToPartner);
    if (vendors.length) vendorSource = 'api';
  } catch {
    /* fallback */
  }

  if (!vendors.length) {
    vendors = DEMO_ADMIN_VENDORS
      .filter((v) => v.status === 'active')
      .map(mapVendorToPartner);
    vendorSource = 'demo';
  }

  const community = MARKETING_PARTNERS
    .filter((p) => p.source !== 'marketplace')
    .map(mapCommunityPartner);

  const partners = [...vendors, ...community];

  const types = [
    ...new Set(partners.map((p) => {
      if (p.source === 'marketplace') return 'Fournisseurs';
      return p.type?.split(' ')[0] || 'Partenaires';
    })),
  ];

  return {
    partners,
    vendors,
    community,
    types,
    vendorSource,
    activeVendorCount: vendors.length,
  };
};

/**
 * Charge témoignages + partenaires pour la landing marketing.
 */
export const fetchMarketingLiveData = () =>
  Promise.all([
    fetchMarketingTestimonials({ limit: 6 }),
    fetchMarketingPartners(),
  ]).then(([testimonials, partners]) => ({
    testimonials,
    partners,
  }));

export default fetchMarketingLiveData;
