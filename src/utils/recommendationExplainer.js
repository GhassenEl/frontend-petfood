import { getProductDetailFields } from './productDetails';
import { petAgeYears } from './petCalorieCalculator';
import { parsePetAllergies } from './petNutritionRecommender';

const normalize = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const extractFatPercent = (composition = '') => {
  const m = normalize(composition).match(/(?:graisse|lipide|matiere\s+grasse)[^\d]*(\d+(?:[.,]\d+)?)\s*%/);
  if (m) return parseFloat(m[1].replace(',', '.'));
  const m2 = normalize(composition).match(/(\d+(?:[.,]\d+)?)\s*%\s*(?:graisse|lipide)/);
  if (m2) return parseFloat(m2[1].replace(',', '.'));
  return null;
};

/** Explainable AI — pourquoi ce produit est recommandé */
export const explainProductRecommendation = (product, pet = {}, recommendation = {}) => {
  if (!product) return null;

  const hay = normalize(
    `${product.name} ${product.description || ''} ${product.category || ''} ${getProductDetailFields(product).composition}`,
  );
  const type = recommendation.type || pet?.type || 'dog';
  const ageYears =
    recommendation.ageYears ??
    petAgeYears(pet?.birthDate) ??
    (pet?.ageYears != null ? Number(pet.ageYears) : null);
  const lifeStage = recommendation.lifeStage || (ageYears >= 7 ? 'senior' : ageYears < 1 ? 'young' : 'adult');
  const reasons = [];

  if (product.animalType === type || product.petType === type || hay.includes(type === 'dog' ? 'chien' : 'chat')) {
    reasons.push({
      code: 'species',
      icon: '🐾',
      label: 'Espèce compatible',
      detail: `Formule adaptée aux ${type === 'cat' ? 'chats' : type === 'dog' ? 'chiens' : 'animaux'}.`,
      confidence: 95,
    });
  }

  if (lifeStage === 'senior' && (hay.includes('senior') || hay.includes('7+'))) {
    reasons.push({
      code: 'age',
      icon: '🎂',
      label: 'Compatible avec l\'âge',
      detail: `Produit senior — adapté à un animal de ${ageYears != null ? `${Math.round(ageYears)} ans` : '7+ ans'}.`,
      confidence: 92,
    });
  } else if ((lifeStage === 'young' || lifeStage === 'chiot' || lifeStage === 'chaton') && (hay.includes('chiot') || hay.includes('chaton') || hay.includes('junior'))) {
    reasons.push({
      code: 'age',
      icon: '🎂',
      label: 'Compatible avec l\'âge',
      detail: 'Formule croissance / junior pour jeune animal.',
      confidence: 90,
    });
  } else if (ageYears != null && ageYears >= 1 && ageYears < 7 && !hay.includes('senior')) {
    reasons.push({
      code: 'age',
      icon: '🎂',
      label: 'Compatible avec l\'âge',
      detail: 'Formule adulte adaptée au stade de vie actuel.',
      confidence: 78,
    });
  }

  const breed = normalize(pet?.breed || recommendation.breed || '');
  if (breed && (hay.includes(breed) || hay.includes('race') || hay.includes('breed'))) {
    reasons.push({
      code: 'breed',
      icon: '🏷️',
      label: 'Adapté à la race',
      detail: `Profil compatible avec ${pet?.breed || 'la race de votre animal'}.`,
      confidence: 85,
    });
  } else if (breed && /labrador|berger|golden|maine/.test(breed) && hay.includes('grand')) {
    reasons.push({
      code: 'breed',
      icon: '🏷️',
      label: 'Adapté à la race',
      detail: 'Taille / besoins énergétiques cohérents avec la race.',
      confidence: 72,
    });
  }

  const fatPct = extractFatPercent(getProductDetailFields(product).composition);
  const goal = recommendation.goal || 'maintien';
  if (fatPct != null && fatPct <= 12) {
    reasons.push({
      code: 'low_fat',
      icon: '💧',
      label: 'Faible teneur en matières grasses',
      detail: `~${fatPct} % de lipides — intéressant pour le contrôle du poids.`,
      confidence: 88,
    });
  } else if (goal === 'perte' && hay.includes('light')) {
    reasons.push({
      code: 'low_fat',
      icon: '💧',
      label: 'Faible teneur en matières grasses',
      detail: 'Gamme « light » alignée sur l\'objectif perte de poids.',
      confidence: 82,
    });
  }

  if (
    product.vetRecommended ||
    product.vetApproved ||
    (product.tags || []).some((t) => /vet|veterinaire|vétérinaire/i.test(String(t))) ||
    hay.includes('veterinaire') ||
    hay.includes('recommande par')
  ) {
    reasons.push({
      code: 'vet',
      icon: '🩺',
      label: 'Recommandé par des vétérinaires',
      detail: 'Produit référencé ou validé par le réseau vétérinaire PetfoodTN.',
      confidence: 91,
    });
  } else if (Number(product.rating_avg) >= 4.5 && Number(product.rating_count) >= 5) {
    reasons.push({
      code: 'reviews',
      icon: '⭐',
      label: 'Très bien noté par les propriétaires',
      detail: `${product.rating_avg}/5 sur ${product.rating_count} avis.`,
      confidence: 75,
    });
  }

  const allergies = recommendation.allergies || parsePetAllergies(pet);
  if (allergies.length && (hay.includes('hypoallerg') || hay.includes('mono-proteine') || hay.includes('sans cereales'))) {
    reasons.push({
      code: 'allergy',
      icon: '🛡️',
      label: 'Adapté aux sensibilités',
      detail: `Formule limitée — sans allergènes déclarés (${allergies.join(', ')}).`,
      confidence: 87,
    });
  }

  const summary =
    reasons.length > 0
      ? `Recommandé car : ${reasons.slice(0, 3).map((r) => r.label.toLowerCase()).join(', ')}.`
      : 'Produit correspondant au profil général de votre animal.';

  return {
    productId: product.id || product._id,
    productName: product.name,
    reasons,
    summary,
    transparencyNote: 'Scores indicatifs (règles métier locales ou démo) — ne remplacent pas l’avis d’un vétérinaire.',
  };
};

export const explainProductList = (products, pet, recommendation) =>
  (products || []).map((p) => ({
    product: p,
    explanation: explainProductRecommendation(p, pet, recommendation),
  }));

export default explainProductRecommendation;
