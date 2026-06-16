import api from '../utils/api';
import { getPets } from './userService';
import { getProducts } from './productService';
import {
  DEMO_NUTRITION_PETS,
  DEMO_PET_WEIGHT_HISTORY,
  DEMO_ORDERS,
  DEMO_FEEDER_HISTORY,
} from '../utils/clientDemoData';
import { buildPetNutritionRecommendation } from '../utils/petNutritionRecommender';
import { explainProductList } from '../utils/recommendationExplainer';
import { detectEarlyHealthRisks } from '../utils/earlyHealthRiskDetector';
import { searchProductsNaturalLanguage } from '../utils/naturalLanguageProductSearch';
import { scoreProductsForPet } from '../utils/productCompatibilityScore';
import { matchProductsForPet } from '../utils/petNutritionRecommender';

const DEMO_MEDICAL = {
  vaccines: [
    {
      id: 'vac-1',
      petName: 'Max',
      vaccineType: 'Rage',
      urgency: 'soon',
      nextDue: new Date(Date.now() + 12 * 86400000).toISOString(),
    },
  ],
  notes: 'Suivi annuel Max — articulations OK, surveiller poids.',
};

const FALLBACK_PRODUCTS = [
  {
    id: 'demo-prod-croq-senior',
    name: 'Croquettes Senior Chien 10 kg',
    animalType: 'dog',
    category: 'croquettes',
    description: 'Formule senior hypoallergénique — lipides 10 % — recommandée vétérinaire',
    composition: 'Saumon 24 %, riz, graisses 10 %, glucosamine',
    rating_avg: 4.7,
    rating_count: 32,
    stock: 18,
    tags: ['veterinaire', 'senior'],
    vetRecommended: true,
  },
  {
    id: 'demo-prod-croq',
    name: 'Croquettes Premium Chien Adulte 12 kg',
    animalType: 'dog',
    category: 'croquettes',
    description: 'Protéines 26 % pour chien actif',
    composition: 'Poulet 28 %, riz, graisses 14 %',
    rating_avg: 4.5,
    rating_count: 48,
    stock: 50,
  },
  {
    id: 'demo-prod-hypo',
    name: 'Croquettes hypoallergéniques chien saumon',
    animalType: 'dog',
    category: 'croquettes',
    description: 'Mono-protéine sans céréales — allergies',
    composition: 'Saumon 30 %, patate, graisses 11 %',
    rating_avg: 4.6,
    rating_count: 21,
    stock: 12,
    tags: ['hypoallergenique'],
  },
  {
    id: 'demo-prod-patee',
    name: 'Pâtée chat saumon 400 g',
    animalType: 'cat',
    category: 'patee',
    description: 'Chat stérilisé',
    rating_avg: 4.3,
    rating_count: 15,
    stock: 40,
  },
];

export async function loadExplainableAiPack(options = {}) {
  const pets = (await getPets().catch(() => [])) || [];
  const petList = pets.length ? pets : DEMO_NUTRITION_PETS.slice(0, 4);
  let products = (await getProducts().catch(() => [])) || [];
  if (!products.length) products = FALLBACK_PRODUCTS;
  const ordersRes = await api.get('/orders').catch(() => ({ data: DEMO_ORDERS }));
  const orders = ordersRes.data?.length ? ordersRes.data : DEMO_ORDERS;

  const petsEnriched = petList.map((pet) => {
    const petId = String(pet.id || pet._id);
    const recommendation = buildPetNutritionRecommendation(pet, options);
    const matched = matchProductsForPet(products, recommendation, 6);
    const explained = explainProductList(matched, pet, recommendation);
    const weightHistory = DEMO_PET_WEIGHT_HISTORY[petId] || [];
    const risks = detectEarlyHealthRisks({
      pet,
      weightHistory,
      orders,
      medicalRecord: DEMO_MEDICAL,
      feedingLogs: DEMO_FEEDER_HISTORY,
    });
    const compatibility = scoreProductsForPet(products, recommendation, pet, 8);

    return {
      pet,
      recommendation,
      explainedProducts: explained,
      healthRisks: risks,
      compatibility,
    };
  });

  return {
    pets: petsEnriched,
    products,
    medicalRecord: DEMO_MEDICAL,
  };
}

export function runNaturalLanguageSearch(products, query) {
  return searchProductsNaturalLanguage(products, query, 10);
}

export default loadExplainableAiPack;
