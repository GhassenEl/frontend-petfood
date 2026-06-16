/**
 * Recommandations nutritionnelles par animal — poids, race, âge.
 * S'appuie sur petCalorieCalculator (RER × MER) + profils races.
 */

import {
  calculatePetCalories,
  petAgeYears,
  PET_TYPE_LABELS,
} from './petCalorieCalculator';

const normalize = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const ALLERGEN_ALIASES = {
  poulet: ['poulet', 'chicken', 'volaille', 'aviaire', 'poultry'],
  boeuf: ['boeuf', 'beef', 'bovin', 'bœuf'],
  agneau: ['agneau', 'lamb', 'mouton'],
  poisson: ['poisson', 'fish', 'saumon', 'salmon'],
  gluten: ['gluten', 'ble', 'blé', 'cereales', 'céréales', 'wheat'],
  lactose: ['lactose', 'lait', 'dairy', 'fromage'],
  oeuf: ['oeuf', 'œuf', 'egg', 'eggs'],
  soja: ['soja', 'soy', 'soya'],
  maïs: ['mais', 'maïs', 'corn'],
};

const HEALTH_KEYWORDS = [
  { key: 'diabete', label: 'Diabète — privilégier faible glycémie et portions stables.', patterns: ['diabete', 'diabète', 'glycemie'] },
  { key: 'renal', label: 'Insuffisance rénale — protéines et phosphore modérés.', patterns: ['renal', 'rénal', 'rein', 'kidney'] },
  { key: 'digestif', label: 'Sensibilité digestive — formule haute digestibilité.', patterns: ['digestif', 'digestion', 'colite', 'vomissement'] },
  { key: 'articulation', label: 'Articulations — glucosamine / oméga-3 utiles.', patterns: ['articulation', 'arthrose', 'hanche', 'dysplasie'] },
  { key: 'obesite', label: 'Surpoids — formule light et ration mesurée.', patterns: ['obesite', 'obésité', 'surpoids', 'overweight'] },
];

export const parsePetAllergies = (pet) => {
  const raw = pet?.allergies ?? pet?.allergy ?? '';
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((a) => normalize(a)).filter((a) => a && !/aucune|none/i.test(a));
  }
  const str = String(raw).trim();
  if (!str || /aucune|none|non/i.test(str)) return [];
  return str.split(/[,;|/]/).map((s) => normalize(s)).filter(Boolean);
};

export const expandAllergenTerms = (allergies) => {
  const terms = new Set();
  (allergies || []).forEach((a) => {
    const key = normalize(a);
    terms.add(key);
    (ALLERGEN_ALIASES[key] || []).forEach((t) => terms.add(normalize(t)));
  });
  return [...terms];
};

export const parsePetHealthFlags = (pet) => {
  const flags = [];
  const sources = [
    pet?.chronicDiseases,
    pet?.chronicDisease,
    pet?.healthConditions,
    pet?.healthStatus,
    pet?.notes,
    pet?.healthNotes,
  ].filter(Boolean);

  const hay = normalize(sources.join(' '));
  if (!hay) return flags;

  HEALTH_KEYWORDS.forEach(({ key, label, patterns }) => {
    if (patterns.some((p) => hay.includes(normalize(p)))) {
      flags.push({ key, label });
    }
  });
  return flags;
};

const DOG_BREEDS = {
  labrador: {
    label: 'Labrador',
    size: 'large',
    idealWeightKg: { min: 25, max: 36 },
    energy: 'high',
    tips: [
      'Formule « grande race » riche en glucosamine pour les articulations.',
      'Labrador très gourmand : pesez les rations, limitez les friandises à 10 % des kcal.',
      'Privilégiez 2 repas/jour pour limiter le risque de dilatation-torsion gastrique.',
    ],
    productKeywords: ['labrador', 'grand chien', 'large', 'articulation', 'chien'],
  },
  'berger allemand': {
    label: 'Berger allemand',
    size: 'large',
    idealWeightKg: { min: 22, max: 40 },
    energy: 'high',
    tips: [
      'Digestion parfois sensible : transition alimentaire sur 10 jours.',
      'Apport protéique modéré à élevé (22–26 %) selon activité (sport, travail).',
      'Surveillez le poids — cette race a un risque de dysplasie si surpoids.',
    ],
    productKeywords: ['berger', 'grand chien', 'sensible', 'chien'],
  },
  golden: {
    label: 'Golden Retriever',
    size: 'large',
    idealWeightKg: { min: 25, max: 34 },
    energy: 'high',
    tips: [
      'Poils longs : formules avec acides gras oméga-3 pour le pelage.',
      'Très actif en jeunesse ; réduisez légèrement les calories après 7 ans.',
    ],
    productKeywords: ['golden', 'poil', 'omega', 'chien'],
  },
  'bulldog francais': {
    label: 'Bulldog français',
    size: 'small',
    idealWeightKg: { min: 8, max: 14 },
    energy: 'low',
    brachycephalic: true,
    tips: [
      'Race brachycéphale : petites croquettes, gamelle surélevée, pas d\'effort après le repas.',
      'Évitez l\'excès calorique — propension au surpoids.',
      'Formule digestible, protéines de qualité.',
    ],
    productKeywords: ['petit chien', 'light', 'digestion', 'chien'],
  },
  caniche: {
    label: 'Caniche',
    size: 'small',
    idealWeightKg: { min: 3, max: 12 },
    energy: 'medium',
    tips: [
      'Adapter la ration à la taille (toy / miniature / standard).',
      'Poils continus : besoins en protéines et oméga-3 pour la peau.',
    ],
    productKeywords: ['petit chien', 'caniche', 'poil', 'chien'],
  },
  chihuahua: {
    label: 'Chihuahua',
    size: 'toy',
    idealWeightKg: { min: 1.5, max: 3 },
    energy: 'medium',
    tips: [
      'Très petit métabolisme : croquettes mini, plusieurs petits repas possibles.',
      'Fragile sur le plan dentaire — croquettes adaptées toy.',
    ],
    productKeywords: ['mini', 'toy', 'petit chien', 'chihuahua'],
  },
  beagle: {
    label: 'Beagle',
    size: 'medium',
    idealWeightKg: { min: 9, max: 14 },
    energy: 'high',
    tips: [
      'Nez fin : très appétent, contrôlez strictement les portions.',
      '2 repas fixes + friandises d\'éducation comptabilisées.',
    ],
    productKeywords: ['beagle', 'medium', 'chien'],
  },
  yorkshire: {
    label: 'Yorkshire',
    size: 'toy',
    idealWeightKg: { min: 1.5, max: 3.5 },
    energy: 'medium',
    tips: [
      'Croquettes très petites, riches en protéines animales.',
      'Attention aux hypoglycémies chez le chiot toy — 3–4 repas/jour jusqu\'à 6 mois.',
    ],
    productKeywords: ['toy', 'yorkshire', 'mini', 'chien'],
  },
  sloughi: {
    label: 'Sloughi (lévrier arabe)',
    size: 'large',
    idealWeightKg: { min: 18, max: 28 },
    energy: 'high',
    tips: [
      'Race tunisienne patrimoniale — très active : formule riche en protéines, lipides modérés.',
      'Éviter le surpoids ; privilégier 2 repas après l\'effort, pas avant.',
      'Besoin d\'espace et d\'exercice : ajuster les kcal selon la course quotidienne.',
    ],
    productKeywords: ['levrier', 'sloughi', 'actif', 'grand chien', 'chien'],
  },
  'levrier arabe': {
    label: 'Lévrier arabe (Sloughi)',
    size: 'large',
    idealWeightKg: { min: 18, max: 28 },
    energy: 'high',
    tips: [
      'Lévrier maghrébin : ration haute qualité, digestion sensible aux graisses excessives.',
      'Protéger des excès de chaleur après les repas en été.',
    ],
    productKeywords: ['levrier', 'sloughi', 'actif', 'chien'],
  },
  khlib: {
    label: 'Khlib / Baladi (chien tunisien)',
    size: 'medium',
    idealWeightKg: { min: 12, max: 22 },
    energy: 'medium',
    tips: [
      'Chien local robuste : formule adulte équilibrée, souvent bon appétit.',
      'Adapter la ration au mode de vie (courtyard vs très actif).',
      'Vaccination et vermifuge à jour — profil métabolique variable.',
    ],
    productKeywords: ['chien', 'adulte', 'medium', 'equilibre'],
  },
  baladi: {
    label: 'Baladi (chien de rue tunisien)',
    size: 'medium',
    idealWeightKg: { min: 10, max: 20 },
    energy: 'medium',
    tips: [
      'Profil rustique : croquettes standard qualité, éviter les restes gras.',
      'Surveiller le poids en milieu urbain (moins d\'activité).',
    ],
    productKeywords: ['chien', 'adulte', 'medium'],
  },
  tunisien: {
    label: 'Chien tunisien',
    size: 'medium',
    idealWeightKg: { min: 12, max: 22 },
    energy: 'medium',
    tips: [
      'Race non standardisée : ajuster selon morphologie réelle et activité.',
      'Consultez un vétérinaire pour objectif pondéral précis.',
    ],
    productKeywords: ['chien', 'adulte'],
  },
  malinois: {
    label: 'Malinois (Berger belge)',
    size: 'large',
    idealWeightKg: { min: 22, max: 32 },
    energy: 'very_high',
    tips: [
      'Très répandu en Tunisie (garde) : besoins élevés si chien de travail.',
      'Formule performance ou grande race active, 2 repas minimum.',
      'Attention : ne pas suralimenter si chien de compagnie sédentaire.',
    ],
    productKeywords: ['malinois', 'berger', 'actif', 'grand chien', 'chien'],
  },
  'berger belge': {
    label: 'Berger belge (Malinois)',
    size: 'large',
    idealWeightKg: { min: 22, max: 32 },
    energy: 'very_high',
    tips: [
      'Élevé énergie : ration adaptée à l\'activité réelle (garde, sport).',
    ],
    productKeywords: ['malinois', 'berger', 'actif', 'chien'],
  },
  barb: {
    label: 'Chien de berger barbaresque',
    size: 'medium',
    idealWeightKg: { min: 20, max: 30 },
    energy: 'high',
    tips: [
      'Chien de travail nord-africain : apport protéique soutenu.',
      'Eau abondante en période chaude.',
    ],
    productKeywords: ['berger', 'actif', 'chien'],
  },
  aidi: {
    label: 'Aïdi (chien de montagne maghrébin)',
    size: 'large',
    idealWeightKg: { min: 23, max: 35 },
    energy: 'high',
    tips: [
      'Chien de garde des Atlas — très actif : formule grande race riche en protéines.',
      'Rustique et résistant : eau fraîche en permanence en climat chaud.',
      '2 repas/jour, éviter l\'effort intense juste après le repas.',
    ],
    productKeywords: ['aidi', 'berger', 'montagne', 'grand chien', 'chien'],
  },
  rottweiler: {
    label: 'Rottweiler',
    size: 'large',
    idealWeightKg: { min: 35, max: 50 },
    energy: 'medium',
    tips: [
      'Race musclée : surveillez le surpoids (articulations).',
      'Formule grande race, glucosamine conseillée après 6 ans.',
    ],
    productKeywords: ['rottweiler', 'grand chien', 'articulation', 'chien'],
  },
  husky: {
    label: 'Husky sibérien',
    size: 'large',
    idealWeightKg: { min: 16, max: 27 },
    energy: 'very_high',
    tips: [
      'Très actif : besoins élevés ; réduire si vie en appartement sans exercice.',
      'Poil dense : oméga-3 ; en Tunisie, privilégier exercice tôt le matin.',
    ],
    productKeywords: ['husky', 'actif', 'grand chien', 'chien'],
  },
  spitz: {
    label: 'Spitz (loulou)',
    size: 'small',
    idealWeightKg: { min: 8, max: 14 },
    energy: 'medium',
    tips: [
      'Petite race nordique populaire : croquettes petit chien, 2 repas.',
      'Poil abondant : formule peau & pelage.',
    ],
    productKeywords: ['spitz', 'loulou', 'petit chien', 'chien'],
  },
  braque: {
    label: 'Braque (chien de chasse)',
    size: 'large',
    idealWeightKg: { min: 22, max: 32 },
    energy: 'very_high',
    tips: [
      'Chien de chasse : ration performance si activité intense.',
      'Digestion sensible après effort — repas 2 h après la chasse.',
    ],
    productKeywords: ['braque', 'chasse', 'actif', 'chien'],
  },
  doberman: {
    label: 'Dobermann',
    size: 'large',
    idealWeightKg: { min: 27, max: 40 },
    energy: 'high',
    tips: [
      'Race athlétique : protéines modérées à élevées selon activité.',
      'Peau fine : oméga-3 ; éviter les graisses en excès.',
    ],
    productKeywords: ['doberman', 'grand chien', 'actif', 'chien'],
  },
  croise: {
    label: 'Croisé (chien tunisien)',
    size: 'medium',
    idealWeightKg: { min: 10, max: 25 },
    energy: 'medium',
    tips: [
      'Profil variable : ajustez la ration selon la morphologie réelle.',
      'Pesée mensuelle recommandée — race non standardisée.',
    ],
    productKeywords: ['chien', 'adulte', 'croise', 'medium'],
  },
  'croise tunisien': {
    label: 'Croisé tunisien',
    size: 'medium',
    idealWeightKg: { min: 10, max: 22 },
    energy: 'medium',
    tips: [
      'Très courant localement : formule adulte équilibrée.',
      'Adapter selon activité (courtyard, rue, campagne).',
    ],
    productKeywords: ['chien', 'adulte', 'tunisie'],
  },
  pinscher: {
    label: 'Pinscher',
    size: 'small',
    idealWeightKg: { min: 4, max: 6 },
    energy: 'high',
    tips: [
      'Petit chien nerveux et actif : croquettes petit format, 2 repas.',
      'Attention hypoglycémie chez le chiot — 3–4 repas jusqu\'à 6 mois.',
    ],
    productKeywords: ['pinscher', 'petit chien', 'mini', 'chien'],
  },
};

const CAT_BREEDS = {
  'maine coon': {
    label: 'Maine Coon',
    size: 'large',
    idealWeightKg: { min: 4.5, max: 8 },
    tips: [
      'Grande race féline : apport protéique élevé, ration supérieure à un chat moyen.',
      'Croissance longue (jusqu\'à 3 ans) : formule kitten/junior prolongée.',
    ],
    productKeywords: ['maine coon', 'grand chat', 'chat'],
  },
  siamois: {
    label: 'Siamois',
    size: 'medium',
    idealWeightKg: { min: 3, max: 5.5 },
    energy: 'high',
    tips: [
      'Métabolisme actif : besoins caloriques légèrement supérieurs à la moyenne.',
      'Aime la variété : mix croquettes + pâtée pour l\'hydratation.',
    ],
    productKeywords: ['siamois', 'actif', 'chat'],
  },
  persan: {
    label: 'Persan',
    size: 'medium',
    idealWeightKg: { min: 3, max: 6 },
    energy: 'low',
    tips: [
      'Poils longs : formule anti-boules de poils, brossage régulier.',
      'Moins actif : surveillez le surpoids, ration stérilisé si castré.',
    ],
    productKeywords: ['persan', 'poil', 'hairball', 'chat'],
  },
  europeen: {
    label: 'Européen (chat tunisien courant)',
    size: 'medium',
    idealWeightKg: { min: 3.5, max: 5.5 },
    tips: [
      'Très répandu en Tunisie : formule adulte équilibrée, 2 repas/jour.',
      'Associez pâtée (10–20 % des kcal) pour l\'hydratation en climat chaud.',
      'Formule stérilisé recommandée si castré.',
    ],
    productKeywords: ['chat', 'adulte', 'europeen', 'sterilise'],
  },
  bengal: {
    label: 'Bengal',
    size: 'medium',
    idealWeightKg: { min: 3.5, max: 7 },
    energy: 'very_high',
    tips: [
      'Très actif : formule riche en protéines animales (> 35 %).',
      'Enrichissement alimentaire (puzzles) pour ralentir la prise.',
    ],
    productKeywords: ['bengal', 'actif', 'chat'],
  },
  'chat tunisien': {
    label: 'Chat tunisien',
    size: 'medium',
    idealWeightKg: { min: 3, max: 5.5 },
    tips: [
      'Chat local maghrébin : rustique, formule adulte équilibrée.',
      'Hydratation importante en climat chaud — ajoutez de la pâtée.',
      'Stérilisation fréquente : formule « stérilisé » recommandée.',
    ],
    productKeywords: ['chat', 'sterilise', 'adulte', 'tunisie'],
  },
  'nord africain': {
    label: 'Chat nord-africain',
    size: 'medium',
    idealWeightKg: { min: 3, max: 5.5 },
    tips: [
      'Morphologie fine et active : protéines animales de qualité.',
      'Accès à l\'eau fraîche en permanence.',
    ],
    productKeywords: ['chat', 'adulte'],
  },
  gouttiere: {
    label: 'Chat de gouttière (Tunisie)',
    size: 'medium',
    idealWeightKg: { min: 3, max: 5 },
    tips: [
      'Profil très courant : ration stérilisé si castré, contrôle du poids.',
      'Parasites externes fréquents en milieu urbain — santé globale liée à l\'appétit.',
    ],
    productKeywords: ['chat', 'sterilise', 'light', 'adulte'],
  },
  chartreux: {
    label: 'Chartreux',
    size: 'medium',
    idealWeightKg: { min: 4, max: 7 },
    energy: 'low',
    tips: [
      'Chat musclé et calme : éviter le surpoids, jouets interactifs.',
      'Poil dense : oméga-3 pour le pelage.',
    ],
    productKeywords: ['chartreux', 'chat', 'poil'],
  },
  'angora turc': {
    label: 'Angora turc',
    size: 'medium',
    idealWeightKg: { min: 3, max: 5 },
    energy: 'high',
    tips: [
      'Poils semi-longs : formule anti-boules de poils, brossage.',
      'Actif et joueur : besoins légèrement supérieurs à la moyenne.',
    ],
    productKeywords: ['angora', 'poil', 'chat', 'actif'],
  },
  'mau egyptien': {
    label: 'Mau égyptien',
    size: 'medium',
    idealWeightKg: { min: 3, max: 5.5 },
    energy: 'high',
    tips: [
      'Race nord-africaine ancienne : très active, protéines animales > 32 %.',
      'Aime courir : enrichissement alimentaire (puzzles) recommandé.',
    ],
    productKeywords: ['mau', 'egyptien', 'actif', 'chat'],
  },
  abyssin: {
    label: 'Abyssin',
    size: 'medium',
    idealWeightKg: { min: 3, max: 5 },
    energy: 'very_high',
    tips: [
      'Poil court, métabolisme vif : besoins caloriques légèrement supérieurs.',
      '2–3 petits repas possibles pour éviter la voracité.',
    ],
    productKeywords: ['abyssin', 'actif', 'chat'],
  },
  british: {
    label: 'British Shorthair',
    size: 'large',
    idealWeightKg: { min: 4, max: 8 },
    energy: 'low',
    tips: [
      'Chat calme et rondouillard : formule stérilisé/light si tendance au surpoids.',
      'Croissance lente : formule kitten jusqu\'à 12–15 mois.',
    ],
    productKeywords: ['british', 'chat', 'light'],
  },
  exotic: {
    label: 'Exotic Shorthair',
    size: 'medium',
    idealWeightKg: { min: 3.5, max: 6 },
    energy: 'low',
    tips: [
      'Face plate : croquettes adaptées, gamelle peu profonde.',
      'Surveillez le surpoids — moins actif que les races longilignes.',
    ],
    productKeywords: ['exotic', 'chat', 'brachycephale'],
  },
  siberien: {
    label: 'Sibérien',
    size: 'large',
    idealWeightKg: { min: 4.5, max: 9 },
    energy: 'high',
    tips: [
      'Grande race semi-longue : apport protéique soutenu.',
      'Poil épais : oméga-3 ; hydratation via pâtée en été.',
    ],
    productKeywords: ['siberien', 'grand chat', 'poil', 'chat'],
  },
  'chat maghrebin': {
    label: 'Chat maghrébin',
    size: 'medium',
    idealWeightKg: { min: 3, max: 5.5 },
    tips: [
      'Profil local fin et agile : formule adulte, pâtée pour l\'hydratation.',
      'Stérilisation fréquente : ration « stérilisé » recommandée.',
    ],
    productKeywords: ['chat', 'maghrebin', 'sterilise', 'tunisie'],
  },
};

const BIRD_BREEDS = {
  canari: {
    label: 'Canari',
    size: 'small',
    idealWeightKg: { min: 0.015, max: 0.03 },
    tips: [
      '15–25 g : mélange canari + folivitamine 2–3×/semaine.',
      'Graines seules insuffisantes — ajoutez légumes verts (épinard, carotte) en petite quantité.',
      'Évitez le chou et l\'avocat.',
    ],
    productKeywords: ['canari', 'oiseau', 'graines', 'bird'],
  },
  perruche: {
    label: 'Perruche',
    size: 'small',
    idealWeightKg: { min: 0.03, max: 0.05 },
    tips: [
      'Granulés + graines (millet, millet spray).',
      'Bloc minéral et eau changée quotidiennement.',
      'Besoins accrus en période de mue.',
    ],
    productKeywords: ['perruche', 'oiseau', 'graines', 'bird'],
  },
  'perruche ondulee': {
    label: 'Perruche ondulée',
    size: 'small',
    idealWeightKg: { min: 0.03, max: 0.045 },
    tips: ['Très courante en Tunisie : 2 repas de graines, légumes frais 3×/semaine.'],
    productKeywords: ['perruche', 'oiseau', 'bird'],
  },
  calopsitte: {
    label: 'Calopsitte',
    size: 'medium',
    idealWeightKg: { min: 0.07, max: 0.12 },
    tips: [
      'Graines + granulés calopsitte, friandises millet modérées.',
      'Sociale : évitez isolement prolongé (stress = perte d\'appétit).',
    ],
    productKeywords: ['calopsitte', 'oiseau', 'bird'],
  },
  inseparable: {
    label: 'Inséparable',
    size: 'small',
    idealWeightKg: { min: 0.04, max: 0.06 },
    tips: ['Couple souvent — double ration si deux oiseaux dans la cage.'],
    productKeywords: ['inseparable', 'oiseau', 'bird'],
  },
  perroquet: {
    label: 'Perroquet',
    size: 'large',
    idealWeightKg: { min: 0.3, max: 1.2 },
    tips: [
      'Granulés extrudés de qualité + fruits/légumes sûrs (sans noyaux toxiques).',
      'Évitez aliments gras et chocolat.',
    ],
    productKeywords: ['perroquet', 'oiseau', 'bird', 'psittacide'],
  },
  'conure': {
    label: 'Conure',
    size: 'medium',
    idealWeightKg: { min: 0.08, max: 0.15 },
    tips: ['Actif : enrichissement alimentaire (puzzles à graines).'],
    productKeywords: ['conure', 'perroquet', 'oiseau', 'bird'],
  },
  pigeon: {
    label: 'Pigeon',
    size: 'medium',
    idealWeightKg: { min: 0.25, max: 0.45 },
    tips: [
      'Grains entiers (maïs, blé, pois) + grit pour la digestion.',
      'Eau propre indispensable en climat chaud.',
    ],
    productKeywords: ['pigeon', 'oiseau', 'grains', 'bird'],
  },
  'pigeon voyageur': {
    label: 'Pigeon voyageur',
    size: 'medium',
    idealWeightKg: { min: 0.35, max: 0.5 },
    tips: [
      'Tradition tunisienne (colombophilie) : besoins élevés en période d\'entraînement.',
      'Mélange grains voyageur (maïs, blé, tournesol) + électrolytes après effort.',
      'Repos digestif 12 h avant une compétition.',
    ],
    productKeywords: ['pigeon', 'voyageur', 'colombe', 'oiseau', 'grains', 'bird'],
  },
  voyageur: {
    label: 'Pigeon voyageur',
    size: 'medium',
    idealWeightKg: { min: 0.35, max: 0.5 },
    tips: [
      'Colombier : adapter la ration au calendrier de vol (repos vs entraînement).',
      'Calcium et grit indispensables.',
    ],
    productKeywords: ['pigeon', 'voyageur', 'oiseau', 'bird'],
  },
  tourterelle: {
    label: 'Tourterelle',
    size: 'small',
    idealWeightKg: { min: 0.12, max: 0.2 },
    tips: [
      'Graines de millet et blé concassé, eau propre quotidienne.',
      'Couple souvent : surveiller le poids de chaque individu.',
    ],
    productKeywords: ['tourterelle', 'oiseau', 'graines', 'bird'],
  },
  serin: {
    label: 'Serin (canari sauvage / domestique)',
    size: 'tiny',
    idealWeightKg: { min: 0.012, max: 0.02 },
    tips: [
      'Très petit : graines de niger et millet, portions minimes.',
      'Supplément vitamine en mue (printemps).',
    ],
    productKeywords: ['serin', 'canari', 'oiseau', 'graines', 'bird'],
  },
  'pigeon biset': {
    label: 'Pigeon biset',
    size: 'medium',
    idealWeightKg: { min: 0.3, max: 0.45 },
    tips: [
      'Pigeon urbain courant : grains variés + calcium.',
      'Évitez le pain sec (digestion, salt).',
    ],
    productKeywords: ['pigeon', 'biset', 'oiseau', 'bird'],
  },
  colombe: {
    label: 'Colombe',
    size: 'medium',
    idealWeightKg: { min: 0.25, max: 0.45 },
    tips: [
      'Grains entiers + eau en climat chaud.',
      'Adapter la ration si vol régulier.',
    ],
    productKeywords: ['colombe', 'pigeon', 'oiseau', 'bird'],
  },
};

const FISH_BREEDS = {
  'poisson rouge': {
    label: 'Poisson rouge',
    size: 'medium',
    idealWeightKg: { min: 0.01, max: 0.3 },
    tips: [
      '2–3 % du poids corporel en nourriture/jour, réparti en 2 prises.',
      'Flocons ou granulés qui coulent lentement — évitez suralimentation (eau trouble).',
      'Température 18–22 °C : métabolisme modéré.',
    ],
    productKeywords: ['poisson rouge', 'goldfish', 'fish', 'poisson', 'flocons'],
  },
  goldfish: {
    label: 'Goldfish',
    size: 'medium',
    idealWeightKg: { min: 0.01, max: 0.25 },
    tips: ['Jeûne 1 jour/semaine possible pour adultes en bonne santé.'],
    productKeywords: ['goldfish', 'poisson', 'fish'],
  },
  betta: {
    label: 'Betta (combattant)',
    size: 'small',
    idealWeightKg: { min: 0.002, max: 0.006 },
    tips: [
      'Carnivore : granulés betta, 3–4 granules/jour ou équivalent.',
      'Évitez surpopulation — stress et maladies.',
    ],
    productKeywords: ['betta', 'combattant', 'poisson', 'fish'],
  },
  guppy: {
    label: 'Guppy',
    size: 'tiny',
    idealWeightKg: { min: 0.0003, max: 0.001 },
    tips: [
      'Micro-granulés, petite quantité 1–2×/jour.',
      'Reproduction rapide : adapter la ration au nombre de poissons.',
    ],
    productKeywords: ['guppy', 'poisson', 'fish', 'tropical'],
  },
  cichlide: {
    label: 'Cichlidé',
    size: 'medium',
    idealWeightKg: { min: 0.05, max: 0.2 },
    tips: ['Granulés cichlidés, protéines modérées à élevées selon espèce.'],
    productKeywords: ['cichlide', 'poisson', 'fish'],
  },
  'poisson tropical': {
    label: 'Poisson tropical',
    size: 'small',
    idealWeightKg: { min: 0.002, max: 0.05 },
    tips: [
      'Flocons multi-espèces : petite pincée 1–2×/jour, retirer l\'excédent.',
      'Température 24–26 °C : métabolisme plus élevé qu\'eau froide.',
    ],
    productKeywords: ['tropical', 'poisson', 'fish', 'aquarium'],
  },
  barbeau: {
    label: 'Barbeau (poisson d\'étang)',
    size: 'medium',
    idealWeightKg: { min: 0.1, max: 1.5 },
    tips: [
      'Poisson robuste, courant en bassins tunisiens : granulés flottants 1–2×/jour.',
      'Température 18–24 °C : métabolisme modéré.',
    ],
    productKeywords: ['barbeau', 'etang', 'poisson', 'fish'],
  },
  neon: {
    label: 'Néon (tétra)',
    size: 'tiny',
    idealWeightKg: { min: 0.0005, max: 0.002 },
    tips: [
      'Micro-granulés, très petite quantité — nourrir en groupe.',
      'Eau 24–26 °C : métabolisme tropical.',
    ],
    productKeywords: ['neon', 'tetra', 'tropical', 'poisson', 'fish'],
  },
  discus: {
    label: 'Discus',
    size: 'medium',
    idealWeightKg: { min: 0.15, max: 0.25 },
    tips: [
      'Exigeant : granulés discus haute qualité, eau stable.',
      '3–4 petits repas/jour pour juvéniles.',
    ],
    productKeywords: ['discus', 'tropical', 'poisson', 'fish'],
  },
  molly: {
    label: 'Molly / Platy',
    size: 'small',
    idealWeightKg: { min: 0.003, max: 0.015 },
    tips: [
      'Flocons ou micro-granulés, 1–2×/jour.',
      'Reproduction facile : adapter au nombre d\'individus.',
    ],
    productKeywords: ['molly', 'platy', 'tropical', 'poisson', 'fish'],
  },
  'carpe koi': {
    label: 'Carpe koï',
    size: 'large',
    idealWeightKg: { min: 0.5, max: 5 },
    tips: [
      'Bassin extérieur : granulés koï selon température (moins en hiver).',
      '2–3 % du poids corporel en saison chaude.',
    ],
    productKeywords: ['koi', 'carpe', 'etang', 'poisson', 'fish'],
  },
  combattant: {
    label: 'Poisson combattant (Betta)',
    size: 'small',
    idealWeightKg: { min: 0.002, max: 0.006 },
    tips: [
      'Solitaire en aquarium : 3–4 granulés betta/jour.',
      'Évitez suralimentation — eau chaude 26–28 °C.',
    ],
    productKeywords: ['betta', 'combattant', 'poisson', 'fish'],
  },
};

const RABBIT_BREEDS = {
  'lapin nain': {
    label: 'Lapin nain',
    size: 'small',
    idealWeightKg: { min: 0.8, max: 1.8 },
    tips: [
      'Foin à volonté (80 %), granulés limités (20–40 g/j selon poids).',
      'Légumes feuilles 1×/jour : laitue romaine, fenouil (pas iceberg).',
    ],
    productKeywords: ['lapin', 'nain', 'rabbit', 'foin', 'granules'],
  },
  nain: {
    label: 'Lapin nain',
    size: 'small',
    idealWeightKg: { min: 0.8, max: 1.8 },
    tips: [
      'Foin à volonté (80 %), granulés limités (20–40 g/j selon poids).',
      'Légumes feuilles 1×/jour : laitue romaine, fenouil (pas iceberg).',
    ],
    productKeywords: ['lapin', 'nain', 'rabbit', 'foin', 'granules'],
  },
  belier: {
    label: 'Bélier (lop)',
    size: 'medium',
    idealWeightKg: { min: 1.5, max: 2.5 },
    tips: [
      'Oreilles tombantes : surveiller otites (appétit variable).',
      'Foin timothy + eau fraîche en permanence.',
    ],
    productKeywords: ['lapin', 'belier', 'rabbit'],
  },
  angora: {
    label: 'Angora',
    size: 'medium',
    idealWeightKg: { min: 2, max: 3.5 },
    tips: [
      'Poil long : apport fibre élevé, brossage fréquent.',
      'Risque de trichobezoars — foin de qualité essentiel.',
    ],
    productKeywords: ['lapin', 'angora', 'rabbit', 'foin'],
  },
  'lapin domestique': {
    label: 'Lapin domestique',
    size: 'medium',
    idealWeightKg: { min: 1.5, max: 3 },
    tips: [
      'Herbivore strict : pas de pain, biscuits sucrés ni chocolat.',
      'Transition alimentaire sur 7 jours si changement de granulés.',
    ],
    productKeywords: ['lapin', 'rabbit', 'foin'],
  },
  rex: {
    label: 'Lapin Rex',
    size: 'medium',
    idealWeightKg: { min: 2.5, max: 4.5 },
    tips: [
      'Poil court dense : foin timothy à volonté, granulés mesurés.',
      'Peau sensible : éviter humidité excessive dans l\'enclos.',
    ],
    productKeywords: ['lapin', 'rex', 'rabbit', 'foin'],
  },
  flandres: {
    label: 'Géant des Flandres',
    size: 'large',
    idealWeightKg: { min: 5, max: 8 },
    tips: [
      'Grande race : foin + granulés proportionnels au poids.',
      'Surveillez les articulations — éviter le surpoids.',
    ],
    productKeywords: ['lapin', 'flandres', 'geant', 'rabbit', 'foin'],
  },
  'lapin belier': {
    label: 'Lapin bélier',
    size: 'medium',
    idealWeightKg: { min: 1.5, max: 2.5 },
    tips: [
      'Oreilles tombantes : contrôle otite régulier (appétit variable).',
      'Foin 80 % de la ration.',
    ],
    productKeywords: ['lapin', 'belier', 'rabbit', 'foin'],
  },
};

const HAMSTER_BREEDS = {
  'syrien': {
    label: 'Hamster syrien (doré)',
    size: 'small',
    idealWeightKg: { min: 0.1, max: 0.2 },
    tips: [
      'Solitaire : 1 hamster/cage. Mélange graines + protéines légères.',
      'Friandises sucrées limitées — risque de diabète.',
    ],
    productKeywords: ['hamster', 'syrien', 'graines'],
  },
  'dore': {
    label: 'Hamster doré',
    size: 'small',
    idealWeightKg: { min: 0.1, max: 0.18 },
    tips: ['15–20 g aliment/jour + légumes frais en petite quantité.'],
    productKeywords: ['hamster', 'dore'],
  },
  'russe': {
    label: 'Hamster russe (campbell/djungarian)',
    size: 'tiny',
    idealWeightKg: { min: 0.035, max: 0.06 },
    tips: [
      'Plus petit que le syrien : portions réduites, stockage joues ≠ suralimentation.',
      'Évitez températures extrêmes (hibernation artificielle dangereuse).',
    ],
    productKeywords: ['hamster', 'russe', 'nain'],
  },
  nain: {
    label: 'Hamster nain',
    size: 'tiny',
    idealWeightKg: { min: 0.03, max: 0.07 },
    tips: ['Granulés hamster nain + eau au biberon quotidien.'],
    productKeywords: ['hamster', 'nain'],
  },
};

const REPTILE_BREEDS = {
  gecko: {
    label: 'Gecko léopard',
    size: 'small',
    idealWeightKg: { min: 0.04, max: 0.08 },
    tips: [
      'Insectivore : grillons/pucerons dustés calcium + D3.',
      'Pas de nourriture végétale pour cette espèce.',
      'Température de digestion : respecter le gradient thermique.',
    ],
    productKeywords: ['gecko', 'reptile', 'insectes'],
  },
  'tortue terrestre': {
    label: 'Tortue terrestre',
    size: 'medium',
    idealWeightKg: { min: 0.5, max: 3 },
    tips: [
      'Herbivore adulte : salades, plantes sûres, calcium.',
      'Pas de fruits en excès (fermentation).',
    ],
    productKeywords: ['tortue', 'reptile', 'herbivore'],
  },
  iguane: {
    label: 'Iguane vert',
    size: 'large',
    idealWeightKg: { min: 2, max: 6 },
    tips: [
      'Jeune : plus protéines végétales ; adulte : feuilles sombres 90 %.',
      'UVB indispensable pour métabolisme calcique.',
    ],
    productKeywords: ['iguane', 'reptile'],
  },
  serpent: {
    label: 'Serpent (compagnie)',
    size: 'medium',
    idealWeightKg: { min: 0.3, max: 2 },
    tips: [
      'Repas selon espèce (souris réfroidies) — fréquence variable (hebdo à mensuel).',
      'Consultez un vétérinaire NAC pour calendrier précis.',
    ],
    productKeywords: ['serpent', 'reptile'],
  },
  'tortue grecque': {
    label: 'Tortue grecque (Testudo graeca)',
    size: 'medium',
    idealWeightKg: { min: 0.3, max: 1.5 },
    tips: [
      'Espèce méditerranéenne très présente en Tunisie : herbivore strict.',
      'Foin, plantes sûres (pissenlit, plantain), calcium en poudre 2×/semaine.',
      'Pas de fruits en excès ; UV naturel ou lampe UVB indispensable.',
      'Hibernation possible en hiver — jeûne progressif sous conseil vétérinaire.',
    ],
    productKeywords: ['tortue', 'grecque', 'testudo', 'reptile', 'herbivore'],
  },
  grecque: {
    label: 'Tortue grecque',
    size: 'medium',
    idealWeightKg: { min: 0.3, max: 1.5 },
    tips: [
      'Herbivore méditerranéen : salades, fleurs comestibles, calcium.',
      'Enclos extérieur ombragé recommandé en climat tunisien.',
    ],
    productKeywords: ['tortue', 'grecque', 'reptile'],
  },
  testudo: {
    label: 'Tortue Testudo (grecque / marginée)',
    size: 'medium',
    idealWeightKg: { min: 0.3, max: 2 },
    tips: [
      'Ne pas confondre avec tortue aquatique — alimentation 100 % végétale adulte.',
      'Consultez un vétérinaire NAC pour le protocole hibernation.',
    ],
    productKeywords: ['testudo', 'tortue', 'reptile'],
  },
  'tortue de floride': {
    label: 'Tortue de Floride (aquatique)',
    size: 'medium',
    idealWeightKg: { min: 0.2, max: 2 },
    tips: [
      'Jeune omnivore, adulte herbivore : granulés tortue aquatique.',
      'UVB + chauffage eau 24–26 °C ; calcium pour la carapace.',
    ],
    productKeywords: ['tortue', 'aquatique', 'floride', 'reptile'],
  },
  pogona: {
    label: 'Pogona (dragon barbu)',
    size: 'medium',
    idealWeightKg: { min: 0.3, max: 0.6 },
    tips: [
      'Omnivore : insectes dustés calcium (jeune) + légumes feuilles (adulte).',
      'Gradient thermique 38–42 °C sous spot UVB.',
    ],
    productKeywords: ['pogona', 'dragon', 'reptile'],
  },
  'dragon barbu': {
    label: 'Dragon barbu',
    size: 'medium',
    idealWeightKg: { min: 0.3, max: 0.6 },
    tips: [
      'Populaire en NAC : alternance insectes et salades selon l\'âge.',
      'Éviter les insectes trop gras (vers de farine seuls insuffisants).',
    ],
    productKeywords: ['dragon', 'pogona', 'reptile'],
  },
  cameleon: {
    label: 'Caméléon',
    size: 'small',
    idealWeightKg: { min: 0.05, max: 0.2 },
    tips: [
      'Insectivore strict : grillons, criquets, supplémentation calcium/D3.',
      'Hydratation par brumisation — ne boit pas en gamelle.',
    ],
    productKeywords: ['cameleon', 'reptile', 'insectes'],
  },
};

const OTHER_BREEDS = {
  'cochon d inde': {
    label: 'Cochon d\'Inde',
    size: 'small',
    idealWeightKg: { min: 0.7, max: 1.2 },
    foodLabel: 'foin + granulés + légumes',
    kcalPer100g: 280,
    tips: [
      'Herbivore strict : vitamine C quotidienne (poivron, persil) — ne synthétise pas.',
      'Foin timothy à volonté, granulés cochon d\'Inde mesurés (pas mélange lapin).',
      'Pas de graines, noix ni fruits sucrés en excès.',
    ],
    productKeywords: ['cochon', 'inde', 'cobaye', 'guinea', 'foin', 'nac'],
    mealSplit: { foin: 70, granulés: 15, légumes: 15 },
    mealNotes: 'Vitamine C fraîche chaque jour — légumes riches en C non négociable.',
  },
  cobaye: {
    label: 'Cobaye',
    size: 'small',
    idealWeightKg: { min: 0.7, max: 1.2 },
    foodLabel: 'foin + granulés + légumes',
    kcalPer100g: 280,
    tips: [
      'Identique au cochon d\'Inde : vitamine C, foin, granulés spécifiques.',
    ],
    productKeywords: ['cobaye', 'cochon', 'nac', 'foin'],
    mealSplit: { foin: 70, granulés: 15, légumes: 15 },
    mealNotes: 'Vitamine C quotidienne obligatoire.',
  },
  furet: {
    label: 'Furet',
    size: 'small',
    idealWeightKg: { min: 0.7, max: 2 },
    foodLabel: 'croquettes furet',
    kcalPer100g: 380,
    tips: [
      'Carnivore strict : croquettes furet (protéines animales > 36 %).',
      'Repas fréquents : 6–8 repas/jour ou aliment à libre accès (métabolisme rapide).',
      'Jamais de fruits/légumes en base — friandises occasionnelles seulement.',
    ],
    productKeywords: ['furet', 'ferret', 'carnivore', 'nac'],
    mealSplit: { croquettes: 100 },
    mealNotes: 'Digestif court : ne pas laisser plus de 4 h sans nourriture.',
  },
  ferret: {
    label: 'Furet (Ferret)',
    size: 'small',
    idealWeightKg: { min: 0.7, max: 2 },
    foodLabel: 'croquettes furet',
    kcalPer100g: 380,
    tips: ['Carnivore obligatoire — pas de croquettes chat/chien.'],
    productKeywords: ['furet', 'ferret', 'nac'],
    mealSplit: { croquettes: 100 },
    mealNotes: 'Aliment à libre accès ou 6–8 repas/jour.',
  },
  chinchilla: {
    label: 'Chinchilla',
    size: 'small',
    idealWeightKg: { min: 0.4, max: 0.7 },
    foodLabel: 'foin + granulés chinchilla',
    kcalPer100g: 260,
    tips: [
      'Digestion fragile : foin de qualité, granulés chinchilla sans fruits.',
      'Bain de poussière régulier — pas d\'humidité.',
      'Friandises (raisin sec) max 1–2/semaine.',
    ],
    productKeywords: ['chinchilla', 'foin', 'nac'],
    mealSplit: { foin: 75, granulés: 25 },
    mealNotes: 'Régime pauvre en graisses et sucres.',
  },
  gerbille: {
    label: 'Gerbille',
    size: 'tiny',
    idealWeightKg: { min: 0.05, max: 0.12 },
    foodLabel: 'mélange gerbille',
    kcalPer100g: 330,
    tips: [
      'Désertique : boit peu, stocke graines — ne pas suralimenter.',
      'Foin + mélange gerbille, protéines légères occasionnelles.',
    ],
    productKeywords: ['gerbille', 'rongeurs', 'nac'],
    mealSplit: { mélange: 85, foin: 15 },
    mealNotes: '1 cuillère à café de mélange/jour selon activité.',
  },
  degu: {
    label: 'Octodon (degu)',
    size: 'small',
    idealWeightKg: { min: 0.17, max: 0.3 },
    foodLabel: 'foin + granulés degu',
    kcalPer100g: 270,
    tips: [
      'Herbivore : foin + granulés degu, très faible en sucre (diabète fréquent).',
      'Pas de fruits — légumes feuilles en petite quantité.',
    ],
    productKeywords: ['degu', 'octodon', 'nac', 'foin'],
    mealSplit: { foin: 70, granulés: 30 },
    mealNotes: 'Zéro sucre — surveiller le poids régulièrement.',
  },
};

const SPECIES_PROFILES = {
  bird: {
    label: 'Oiseau',
    idealWeightKg: { min: 0.02, max: 0.5 },
    tips: [
      'Poids en kg (ex. 0.04 = 40 g). Eau et grit/minéraux à disposition.',
      'Indiquez l\'espèce (perruche, canari…) pour affiner la ration.',
    ],
    productKeywords: ['oiseau', 'bird', 'graines'],
  },
  fish: {
    label: 'Poisson',
    idealWeightKg: { min: 0.001, max: 0.3 },
    tips: [
      'Poids individuel souvent en grammes (0.01 kg = 10 g).',
      'Ne pas confondre avec le volume de l\'aquarium.',
    ],
    productKeywords: ['poisson', 'fish', 'aquarium', 'flocons'],
  },
  rabbit: {
    label: 'Lapin',
    idealWeightKg: { min: 1, max: 3.5 },
    tips: ['Foin libre-service, granulés mesurés.'],
    productKeywords: ['lapin', 'rabbit', 'foin'],
  },
  hamster: {
    label: 'Hamster',
    idealWeightKg: { min: 0.03, max: 0.2 },
    tips: ['Petit mammifère : stockage dans les joues ≠ besoin supplémentaire.'],
    productKeywords: ['hamster', 'graines'],
  },
  reptile: {
    label: 'Reptile',
    idealWeightKg: { min: 0.05, max: 5 },
    tips: ['Alimentation très variable (herbivore, insectivore, carnivore).'],
    productKeywords: ['reptile'],
  },
  other: {
    label: 'NAC / autre espèce',
    idealWeightKg: { min: 0.05, max: 5 },
    tips: [
      'Cochon d\'Inde, furet, chinchilla… : consultez un vétérinaire NAC.',
      'Renseignez l\'espèce exacte dans le profil animal.',
    ],
    productKeywords: ['nac', 'other'],
  },
};

const BREED_MAP_BY_TYPE = {
  dog: DOG_BREEDS,
  cat: CAT_BREEDS,
  bird: BIRD_BREEDS,
  fish: FISH_BREEDS,
  rabbit: RABBIT_BREEDS,
  hamster: HAMSTER_BREEDS,
  reptile: REPTILE_BREEDS,
  other: OTHER_BREEDS,
};

const matchBreedInMap = (breedRaw, breedMap) => {
  const key = normalize(breedRaw);
  if (!key) return null;
  if (breedMap[key]) return { ...breedMap[key], breed: breedRaw || breedMap[key].label, matched: true };
  for (const [k, profile] of Object.entries(breedMap)) {
    if (key.includes(k) || k.includes(key)) {
      return { ...profile, breed: breedRaw || profile.label, matched: true };
    }
  }
  return null;
};

const inferDogSize = (weightKg) => {
  const w = Number(weightKg);
  if (!w || w <= 0) return 'medium';
  if (w < 6) return 'toy';
  if (w < 15) return 'small';
  if (w < 25) return 'medium';
  if (w < 40) return 'large';
  return 'giant';
};

const inferCatSize = (weightKg) => {
  const w = Number(weightKg);
  if (!w || w <= 0) return 'medium';
  if (w < 3.5) return 'small';
  if (w < 6) return 'medium';
  return 'large';
};

export const resolveBreedProfile = (pet) => {
  const type = String(pet?.type || pet?.animalType || 'dog').toLowerCase();
  const breedRaw = pet?.breed || pet?.species || '';
  const weight = Number(pet?.weight ?? pet?.weightKg ?? 0);
  const breedMap = BREED_MAP_BY_TYPE[type];

  if (breedMap) {
    const matched = matchBreedInMap(breedRaw, breedMap);
    if (matched) return matched;

    if (type === 'dog') {
      const size = inferDogSize(weight);
      return {
        label: breedRaw || 'Chien (race non répertoriée)',
        breed: breedRaw || null,
        size,
        matched: false,
        idealWeightKg: size === 'toy' ? { min: 1, max: 5 }
          : size === 'small' ? { min: 5, max: 12 }
            : size === 'medium' ? { min: 12, max: 25 }
              : size === 'large' ? { min: 25, max: 40 }
                : { min: 40, max: 70 },
        tips: [
          `Taille estimée « ${size} » selon le poids (${weight || '?'} kg).`,
          'Affinez la race dans le dossier vétérinaire pour des conseils plus précis.',
        ],
        productKeywords: [size === 'large' || size === 'giant' ? 'grand chien' : 'chien'],
      };
    }

    if (type === 'cat') {
      const size = inferCatSize(weight);
      return {
        label: breedRaw || 'Chat (race non répertoriée)',
        breed: breedRaw || null,
        size,
        matched: false,
        idealWeightKg: size === 'small' ? { min: 2.5, max: 4 }
          : size === 'large' ? { min: 5, max: 8 }
            : { min: 3.5, max: 5.5 },
        tips: [
          `Profil estimé selon le poids (${weight || '?'} kg).`,
          'Indiquez la race dans Santé & vétérinaire pour affiner les recommandations.',
        ],
        productKeywords: ['chat'],
      };
    }

    const speciesDefault = SPECIES_PROFILES[type] || SPECIES_PROFILES.other;
    return {
      ...speciesDefault,
      breed: breedRaw || null,
      size: speciesDefault.size || 'medium',
      matched: false,
      tips: [
        ...(speciesDefault.tips || []),
        breedRaw ? `Variété renseignée : ${breedRaw}.` : 'Précisez la variété/espèce dans le profil.',
      ],
    };
  }

  const fallback = SPECIES_PROFILES.other;
  return {
    label: breedRaw || PET_TYPE_LABELS[type] || type,
    breed: breedRaw || null,
    size: 'medium',
    matched: false,
    idealWeightKg: fallback.idealWeightKg,
    tips: fallback.tips,
    productKeywords: fallback.productKeywords,
  };
};

export const getWeightStatus = (weightKg, idealRange) => {
  const w = Number(weightKg);
  if (!w || !idealRange) return 'unknown';
  if (w < idealRange.min * 0.9) return 'underweight';
  if (w > idealRange.max * 1.1) return 'overweight';
  if (w < idealRange.min) return 'lean';
  if (w > idealRange.max) return 'heavy';
  return 'ideal';
};

const lifeStageAdvice = (type, ageYears) => {
  if (ageYears == null) {
    return {
      stage: 'adulte',
      label: 'Adulte (âge non renseigné)',
      tips: ['Renseignez la date de naissance pour adapter chiot/chaton/senior.'],
    };
  }

  if (type === 'dog') {
    if (ageYears < 0.5) {
      return {
        stage: 'chiot',
        label: 'Chiot (< 6 mois)',
        tips: [
          'Formule chiot : 3–4 repas/jour, croissance rapide.',
          'Ne pas supplémenter en calcium sans avis vétérinaire.',
        ],
      };
    }
    if (ageYears < 1) {
      return {
        stage: 'chiot_junior',
        label: 'Jeune chien (6–12 mois)',
        tips: ['Passage progressif à 2–3 repas, surveillez la courbe de poids.'],
      };
    }
    if (ageYears >= 8) {
      return {
        stage: 'senior',
        label: 'Chien senior (8+ ans)',
        tips: [
          'Formule senior : moins calorique, soutien articulaire et rénal.',
          'Pesée mensuelle recommandée.',
        ],
      };
    }
    return { stage: 'adulte', label: 'Chien adulte', tips: ['2 repas/jour, eau fraîche à volonté.'] };
  }

  if (type === 'cat') {
    if (ageYears < 1) {
      return {
        stage: 'chaton',
        label: 'Chaton (< 1 an)',
        tips: ['Formule kitten, libre-service ou 4 repas jusqu\'à 6 mois.'],
      };
    }
    if (ageYears >= 10) {
      return {
        stage: 'senior',
        label: 'Chat senior (10+ ans)',
        tips: ['Formule senior, surveillance rénale et hydratation (pâtée).'],
      };
    }
    return { stage: 'adulte', label: 'Chat adulte', tips: ['2 repas, 10–20 % pâtée pour l\'hydratation.'] };
  }

  if (type === 'rabbit') {
    if (ageYears < 1) {
      return {
        stage: 'jeune',
        label: 'Jeune lapin (< 1 an)',
        tips: ['Foin timothy à volonté, granulés jeune lapin, introduction légumes progressive.'],
      };
    }
    if (ageYears >= 5) {
      return {
        stage: 'senior',
        label: 'Lapin senior (5+ ans)',
        tips: ['Granulés senior, surveillance dentaire et arthrose.'],
      };
    }
    return { stage: 'adulte', label: 'Lapin adulte', tips: ['Foin 80 %, granulés mesurés, eau fraîche.'] };
  }

  if (type === 'bird') {
    if (ageYears < 1) {
      return {
        stage: 'jeune',
        label: 'Oisillon / jeune oiseau',
        tips: ['Formule croissance ou graines enrichies, supplément calcium en mue.'],
      };
    }
    if (ageYears >= 5) {
      return {
        stage: 'senior',
        label: 'Oiseau âgé (5+ ans)',
        tips: ['Granulés faciles à croquer, contrôle du poids annuel.'],
      };
    }
    return { stage: 'adulte', label: 'Oiseau adulte', tips: ['2 repas de graines/granulés + légumes sûrs.'] };
  }

  if (type === 'fish') {
    return {
      stage: 'adulte',
      label: ageYears != null && ageYears < 0.5 ? 'Alevin / juvénile' : 'Poisson adulte',
      tips: ageYears != null && ageYears < 0.5
        ? ['Micro-granulés, petites fréquences (3–4×/jour).']
        : ['1–2 repas/jour, quantité consommée en 2–3 minutes.'],
    };
  }

  if (type === 'hamster') {
    if (ageYears < 1) {
      return {
        stage: 'jeune',
        label: 'Jeune hamster',
        tips: ['Mélange jeune rongeurs, évitez fruits sucrés.'],
      };
    }
    return { stage: 'adulte', label: 'Hamster adulte', tips: ['1–2 cuillères de mélange/jour selon taille.'] };
  }

  if (type === 'reptile') {
    return {
      stage: ageYears != null && ageYears < 1 ? 'jeune' : 'adulte',
      label: ageYears != null && ageYears < 1 ? 'Reptile juvénile' : 'Reptile adulte',
      tips: ['Fréquence des repas selon espèce — vétérinaire NAC recommandé.'],
    };
  }

  if (type === 'other') {
    return {
      stage: 'adulte',
      label: 'NAC / autre',
      tips: [
        'Cochon d\'Inde : vitamine C quotidienne + foin.',
        'Furet : carnivore strict, repas fréquents.',
        'Chinchilla : foin, très peu de sucre.',
      ],
    };
  }

  return { stage: 'adulte', label: 'Adulte', tips: [] };
};

const adjustGoalFromWeight = (goal, weightStatus) => {
  if (weightStatus === 'overweight' || weightStatus === 'heavy') return 'perte';
  if (weightStatus === 'underweight' || weightStatus === 'lean') return 'prise';
  return goal;
};

export const buildPetNutritionRecommendation = (pet, options = {}) => {
  const type = String(pet?.type || pet?.animalType || 'dog').toLowerCase();
  const breedProfile = resolveBreedProfile(pet);
  const ageYears =
    options.ageYears != null && !Number.isNaN(Number(options.ageYears))
      ? Number(options.ageYears)
      : pet?.ageYears != null
        ? Number(pet.ageYears)
        : petAgeYears(pet?.birthDate);

  const weightKg = Number(pet?.weight ?? pet?.weightKg ?? 0);
  const weightStatus = getWeightStatus(weightKg, breedProfile.idealWeightKg);
  const lifeStage = lifeStageAdvice(type, ageYears);
  const goal = adjustGoalFromWeight(options.goal || 'maintien', weightStatus);

  const calories = calculatePetCalories(pet, {
    ...options,
    ageYears,
    goal,
    ...(breedProfile.kcalPer100g ? { kcalPer100g: breedProfile.kcalPer100g } : {}),
  });

  const foodLabel = breedProfile.foodLabel || calories.foodLabel || 'aliment';
  const recommendations = [];

  recommendations.push({
    id: 'calories',
    category: 'portion',
    priority: 'high',
    title: 'Apport calorique quotidien',
    text: calories.supported
      ? `${calories.dailyKcal} kcal/jour (~${calories.dryFoodGramsPerDay} g ${foodLabel}, ${calories.gramsPerMeal} g × ${calories.mealCount} repas).`
      : calories.message || 'Complétez le poids pour calculer la ration.',
  });

  if (breedProfile.breed) {
    recommendations.push({
      id: 'breed',
      category: 'breed',
      priority: 'high',
      title: `Race : ${breedProfile.label || breedProfile.breed}`,
      text: breedProfile.matched
        ? `Profil race reconnu (taille ${breedProfile.size}). Poids idéal indicatif : ${breedProfile.idealWeightKg?.min}–${breedProfile.idealWeightKg?.max} kg.`
        : `Race « ${breedProfile.breed} » — profil estimé par poids et espèce.`,
    });
  }

  if (weightStatus !== 'unknown' && weightStatus !== 'ideal') {
    const statusLabels = {
      underweight: 'sous-poids',
      lean: 'plutôt maigre',
      heavy: 'léger surpoids',
      overweight: 'surpoids',
    };
    recommendations.push({
      id: 'weight',
      category: 'weight',
      priority: weightStatus === 'overweight' || weightStatus === 'underweight' ? 'high' : 'medium',
      title: `État pondéral : ${statusLabels[weightStatus]}`,
      text:
        weightStatus === 'overweight' || weightStatus === 'heavy'
          ? `Objectif ajusté : perte de poids. Réduisez friandises, formule « light », activité progressive.`
          : `Objectif ajusté : prise de masse contrôlée. Fractionnez les repas, formule haute digestibilité.`,
    });
  }

  recommendations.push({
    id: 'life',
    category: 'life_stage',
    priority: 'medium',
    title: lifeStage.label,
    text: lifeStage.tips.join(' '),
  });

  (breedProfile.tips || []).forEach((tip, i) => {
    recommendations.push({
      id: `breed-tip-${i}`,
      category: 'breed_specific',
      priority: 'medium',
      title: 'Conseil race',
      text: tip,
    });
  });

  if (goal === 'perte') {
    recommendations.push({
      id: 'goal-perte',
      category: 'goal',
      priority: 'high',
      title: 'Objectif perte de poids',
      text: 'Réduction 10–20 % des kcal sous supervision vétérinaire. Pas de jeûne brutal.',
    });
  }

  const allergies = parsePetAllergies(pet);
  const healthFlags = parsePetHealthFlags(pet);

  if (allergies.length) {
    recommendations.push({
      id: 'allergies',
      category: 'health',
      priority: 'high',
      title: 'Allergies alimentaires',
      text: `Éviter : ${allergies.join(', ')}. Privilégier formules hypoallergéniques ou mono-protéine.`,
    });
  }

  healthFlags.forEach((flag, i) => {
    recommendations.push({
      id: `health-${flag.key || i}`,
      category: 'health',
      priority: 'high',
      title: 'État de santé',
      text: flag.label,
    });
  });

  const allergyKeywords = allergies.length
    ? ['hypoallergenique', 'hypoallergénique', 'sensible', 'mono-proteine', 'limited']
    : [];

  const mealPlanByType = {
    dog: {
      split: { croquettes: 90, patée: 10 },
      notes: 'L\'eau fraîche doit être disponible en permanence.',
    },
    cat: {
      split: { croquettes: 80, patée: 20 },
      notes: '10–20 % de la ration en pâtée améliore l\'hydratation.',
    },
    rabbit: {
      split: { granulés: 15, foin: 85 },
      notes: 'Foin timothy à volonté ; granulés mesurés selon le poids.',
    },
    bird: {
      split: { graines: 70, granulés: 20, légumes: 10 },
      notes: 'Variez graines, granulés et légumes sûrs. Grit et eau à disposition.',
    },
    fish: {
      split: { flocons: 100 },
      notes: '1–2 repas/jour, quantité consommée en 2–3 minutes.',
    },
    hamster: {
      split: { mélange: 100 },
      notes: '1–2 cuillères de mélange/jour ; friandises limitées.',
    },
    reptile: {
      split: { aliment: 100 },
      notes: 'Fréquence et type d\'aliment selon espèce (herbivore, insectivore, carnivore).',
    },
    other: {
      split: { aliment: 100 },
      notes: 'Consultez un vétérinaire NAC pour la ration adaptée à l\'espèce.',
    },
  };

  const mealConfig = mealPlanByType[type] || mealPlanByType.other;
  const breedMealSplit = breedProfile.mealSplit;
  const breedMealNotes = breedProfile.mealNotes;

  const mealPlan = calories.supported
    ? {
        mealsPerDay: calories.mealCount,
        gramsPerMeal: calories.gramsPerMeal,
        gramsPerDay: calories.dryFoodGramsPerDay,
        kcalPerDay: calories.dailyKcal,
        foodLabel,
        split: breedMealSplit || mealConfig.split,
        notes: breedMealNotes || mealConfig.notes,
      }
    : null;

  return {
    petId: pet?.id || pet?._id || null,
    name: pet?.name || 'Animal',
    type,
    breed: breedProfile.breed || pet?.breed || null,
    ageYears: ageYears != null ? Math.round(ageYears * 10) / 10 : null,
    weightKg: weightKg || null,
    weightStatus,
    idealWeightKg: breedProfile.idealWeightKg,
    lifeStage: lifeStage.stage,
    lifeStageLabel: lifeStage.label,
    goal,
    calories,
    breedProfile,
    recommendations,
    mealPlan,
    allergies,
    healthFlags,
    productKeywords: [
      ...(breedProfile.productKeywords || []),
      ...allergyKeywords,
      lifeStage.stage === 'chiot' || lifeStage.stage === 'chiot_junior' ? 'chiot' : '',
      lifeStage.stage === 'chaton' ? 'chaton' : '',
      lifeStage.stage === 'senior' ? 'senior' : '',
      goal === 'perte' ? 'light' : '',
      type,
    ].filter(Boolean),
    disclaimer:
      allergies.length || healthFlags.length
        ? 'Recommandations indicatives basées sur poids, race, âge, allergies et santé. Validation vétérinaire obligatoire avant changement alimentaire.'
        : 'Recommandations indicatives basées sur poids, race et âge. Validation vétérinaire recommandée avant changement alimentaire.',
  };
};

export const matchProductsForPet = (products, recommendation, limit = 4) => {
  if (!products?.length || !recommendation) return [];

  const keywords = (recommendation.productKeywords || []).map(normalize);
  const type = recommendation.type;
  const allergenTerms = expandAllergenTerms(recommendation.allergies || []);

  const scored = products
    .filter((p) => Number(p.stock ?? p.quantity ?? 0) > 0)
    .map((p) => {
      const hay = normalize(`${p.name} ${p.description || ''} ${p.category || ''} ${p.animalType || ''} ${(p.tags || []).join(' ')} ${p.composition || ''}`);
      let score = 0;
      if (p.animalType === type || p.petType === type) score += 3;
      keywords.forEach((kw) => {
        if (kw && hay.includes(kw)) score += 2;
      });
      if (recommendation.goal === 'perte' && hay.includes('light')) score += 3;
      if ((recommendation.lifeStage === 'chiot' || recommendation.lifeStage === 'chiot_junior') && hay.includes('chiot')) score += 4;
      if (recommendation.lifeStage === 'chaton' && hay.includes('chaton')) score += 4;
      if (recommendation.lifeStage === 'senior' && hay.includes('senior')) score += 3;
      if (type === 'bird' && (hay.includes('oiseau') || hay.includes('bird') || hay.includes('graine'))) score += 2;
      if (type === 'fish' && (hay.includes('poisson') || hay.includes('fish') || hay.includes('aquarium'))) score += 2;
      if (type === 'rabbit' && (hay.includes('lapin') || hay.includes('foin') || hay.includes('rabbit'))) score += 2;
      if (type === 'hamster' && (hay.includes('hamster') || hay.includes('rongeurs'))) score += 3;
      if (type === 'reptile' && (hay.includes('reptile') || hay.includes('tortue') || hay.includes('gecko'))) score += 3;
      if (type === 'other' && (hay.includes('nac') || hay.includes('cochon') || hay.includes('furet'))) score += 2;

      if (allergenTerms.length) {
        const hit = allergenTerms.filter((term) => term && hay.includes(term));
        if (hit.length) score -= hit.length * 8;
        if (hay.includes('hypoallerg') || hay.includes('sans cereales') || hay.includes('mono-proteine') || hay.includes('limited ingredient')) {
          score += 5;
        }
      }

      return { product: p, score, allergenConflict: allergenTerms.some((term) => term && hay.includes(term)) };
    })
    .filter((x) => x.score > 0 && !x.allergenConflict)
    .sort((a, b) => b.score - a.score);

  const reasonParts = [recommendation.name];
  if (recommendation.breed) reasonParts.push(recommendation.breed);
  if (allergenTerms.length) reasonParts.push('sans allergènes déclarés');

  return scored.slice(0, limit).map(({ product, score }) => ({
    ...product,
    nutritionMatchScore: score,
    recommendedReason: `Adapté au profil ${reasonParts.join(' · ')}`,
  }));
};

export const buildAllPetNutritionRecommendations = (pets, options = {}) =>
  (pets || []).map((pet) => buildPetNutritionRecommendation(pet, options));
