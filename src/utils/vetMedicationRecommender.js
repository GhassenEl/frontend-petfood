/**
 * Recommandation médicaments vétérinaire — diagnostic, symptômes, espèce, poids, stock pharmacie.
 */

import { DEMO_VET_PHARMACY_MEDS, DEMO_VET_BI } from './vetDemoData';
import { FREQUENCY_OPTIONS, DURATION_OPTIONS } from './medications';

const normalize = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const ANIMAL_ALIASES = {
  dog: ['dog', 'chien', 'canin'],
  cat: ['cat', 'chat', 'felin'],
  bird: ['bird', 'oiseau', 'avian'],
  rabbit: ['rabbit', 'lapin'],
  other: ['other', 'nac', 'nac'],
};

export const SYMPTOM_DISEASE_HINTS = [
  { keywords: ['grattage', 'prurit', 'demangeaison', 'rougeur', 'pelage'], diseases: ['Dermatite allergique', 'Dermatite', 'Parasites externes'] },
  { keywords: ['boite', 'lame', 'articulation', 'raideur'], diseases: ['Arthrose', 'Arthrite'] },
  { keywords: ['vomissement', 'diarrhee', 'anorexie'], diseases: ['Gastro-entérite', 'Infection digestive'] },
  { keywords: ['toux', 'eternuement', 'ecoulement nasal'], diseases: ['Typhus / Coryza', 'Infection respiratoire'] },
  { keywords: ['oreille', 'otite', 'secoue tete'], diseases: ['Otite'] },
  { keywords: ['puce', 'tique', 'parasite'], diseases: ['Parasites externes'] },
  { keywords: ['fièvre', 'fievre', 'abattement'], diseases: ['Infection cutanée', 'Infection générale'] },
];

const EXTRA_PROTOCOLS = [
  {
    disease: 'Otite',
    animalTypes: ['dog', 'cat', 'chien', 'chat'],
    medication: 'Collyre auriculaire antibiotique',
    dosage: '2 gouttes / oreille',
    frequency: '2×/jour',
    duration: '10 jours',
    quantity: 1,
    unit: 'flacon',
    rationale: 'Otite externe non compliquée — nettoyage préalable.',
    priority: 'high',
  },
  {
    disease: 'Typhus / Coryza',
    animalTypes: ['cat', 'chat'],
    medication: 'Amoxicilline 500 mg',
    dosage: '12 mg/kg',
    frequency: '2×/12h',
    duration: '10 jours',
    quantity: 20,
    unit: 'cp',
    rationale: 'Infection respiratoire chat — protocole antibiotique standard.',
    priority: 'high',
  },
  {
    disease: 'Gastro-entérite',
    animalTypes: ['dog', 'cat', 'chien', 'chat'],
    medication: 'Probiotique intestinal',
    dosage: '1 sachet',
    frequency: '1×/jour',
    duration: '7 jours',
    quantity: 7,
    unit: 'sachet',
    rationale: 'Rééquilibrage flore — hydratation et jeûne court si prescrit.',
    priority: 'medium',
  },
  {
    disease: 'Arthrite',
    animalTypes: ['dog', 'chien'],
    medication: 'Anti-inflammatoire chien',
    dosage: '1 cp / 20 kg',
    frequency: '1×/jour',
    duration: '10 jours',
    quantity: 10,
    unit: 'cp',
    rationale: 'AINS — surveiller digestif, contrepulsion gastrique si at risk.',
    priority: 'high',
  },
];

const looksLikeDuration = (value) => {
  const v = normalize(value);
  if (!v || v === '-' || v === '—') return false;
  return /^\d+\s*(j|jour|jours|sem|semaine|mois|an|ans)\b/.test(v);
};

const looksLikeFrequency = (value) => {
  const v = normalize(value);
  if (!v) return false;
  if (FREQUENCY_OPTIONS.some((f) => normalize(f) === v)) return true;
  if (looksLikeDuration(value)) return false;
  return /(x\/|fois|besoin|bain|\/\s*semaine|\/\s*jour|12\s*h|24\s*h|annuel)/.test(v);
};

const closestDurationDays = (days) => {
  const options = [3, 5, 7, 10, 14, 21, 30];
  return options.reduce((best, d) => (Math.abs(d - days) < Math.abs(best - days) ? d : best), 30);
};

const parseDurationToOption = (value) => {
  const raw = String(value || '').trim();
  const v = normalize(raw);
  if (!v || v === '-' || v === '—') return '7 jours';
  if (DURATION_OPTIONS.includes(raw)) return raw;

  const dayMatch = v.match(/^(\d+)\s*j/);
  if (dayMatch) return `${closestDurationDays(Number(dayMatch[1]))} jours`;

  const weekMatch = v.match(/^(\d+)\s*sem/);
  if (weekMatch) return `${closestDurationDays(Number(weekMatch[1]) * 7)} jours`;

  if (v.includes('mois')) {
    const monthMatch = v.match(/^(\d+)\s*mois/);
    const months = monthMatch ? Number(monthMatch[1]) : 1;
    return `${closestDurationDays(months * 30)} jours`;
  }

  if (v.includes('jour')) return raw;
  return raw || '7 jours';
};

const parseFrequencyToOption = (value) => {
  const raw = String(value || '').trim();
  const v = normalize(raw);
  if (!raw) return '1×/jour';
  const exact = FREQUENCY_OPTIONS.find((f) => normalize(f) === v);
  if (exact) return exact;

  if (v.includes('12') && v.includes('h')) return '2×/12h';
  if (v.includes('24') && v.includes('h')) return '1×/jour';
  if (v.includes('2') && v.includes('jour')) return '2×/jour';
  if (v.includes('besoin')) return 'Au besoin';
  if (v.includes('bain') || (v.includes('semaine') && !looksLikeDuration(raw))) return '1×/semaine';
  if (v.includes('30') && v.includes('j')) return '1×/semaine';
  if (v.includes('annuel')) return '1×/semaine';
  if (v.includes('jour') && !looksLikeDuration(raw)) return '1×/jour';

  return raw;
};

/** Corrige les protocoles BI où fréquence/durée sont inversées ou abrégées. */
export const normalizeScheduleFields = ({ dosage = '', frequency = '', duration = '' } = {}) => {
  let dose = String(dosage || '').trim();
  let freq = String(frequency || '').trim();
  let dur = String(duration || '').trim();

  if (looksLikeFrequency(dose)) {
    freq = dose;
    dose = dose.toLowerCase().includes('bain') ? '1 application' : dose;
  }

  if (looksLikeDuration(freq)) {
    if (!looksLikeDuration(dur)) dur = freq;
    freq = parseFrequencyToOption(looksLikeFrequency(dosage) ? dosage : '1×/jour');
  }

  if (looksLikeFrequency(dose) && dose !== '1 application') {
    dose = dose.toLowerCase().includes('bain') ? '1 application' : dose;
  }

  return {
    dosage: dose,
    frequency: parseFrequencyToOption(freq),
    duration: parseDurationToOption(dur),
  };
};

const matchesAnimal = (protocolAnimals, animalType) => {
  if (!animalType) return true;
  const t = normalize(animalType);
  const types = String(protocolAnimals || '')
    .split(',')
    .map((x) => normalize(x.trim()));
  if (!types.length) return true;
  return types.some((a) => {
    if (t.includes(a) || a.includes(t)) return true;
    return Object.entries(ANIMAL_ALIASES).some(([key, aliases]) =>
      (t === key || aliases.some((al) => t.includes(al))) &&
      (a === key || aliases.some((al) => a.includes(al))),
    );
  });
};

const inferDiseasesFromText = (text) => {
  const key = normalize(text);
  if (!key) return [];
  const found = new Set();

  (DEMO_VET_BI.diseaseTreatments || []).forEach((dt) => {
    const d = normalize(dt.disease);
    if (key.includes(d) || d.includes(key)) found.add(dt.disease);
  });

  SYMPTOM_DISEASE_HINTS.forEach((hint) => {
    if (hint.keywords.some((kw) => key.includes(normalize(kw)))) {
      hint.diseases.forEach((d) => found.add(d));
    }
  });

  EXTRA_PROTOCOLS.forEach((p) => {
    if (key.includes(normalize(p.disease))) found.add(p.disease);
  });

  return [...found];
};

const findCatalogMed = (catalog, medName) => {
  const key = normalize(medName);
  return (catalog || []).find((c) => {
    const n = normalize(c.name);
    return n === key || n.includes(key) || key.includes(n);
  });
};

const mgPerKgRules = {
  amoxicilline: { mgPerKg: 12, unit: 'mg', frequency: '2×/12h', duration: '7 jours', round: 'ceil' },
  'anti-inflammatoire': { mgPerKg: 2, unit: 'mg', frequency: '1×/jour', duration: '10 jours', round: 'ceil' },
  antihistaminique: { fixedDose: 'Selon poids (<4 kg : ½ cp)', frequency: '1×/jour', duration: '7 jours' },
};

export const calculateLocalDose = (medicationName, weightKg) => {
  const w = Number(weightKg);
  if (!w || w <= 0) return null;
  const key = normalize(medicationName);
  const rule = Object.entries(mgPerKgRules).find(([k]) => key.includes(k))?.[1];
  if (!rule) return null;

  if (rule.fixedDose) {
    return {
      dosage: rule.fixedDose,
      frequency: rule.frequency,
      duration: rule.duration,
      quantity: 7,
    };
  }

  const totalMg = Math.ceil(w * rule.mgPerKg);
  return {
    dosage: `${totalMg} ${rule.unit} (${rule.mgPerKg} mg/kg × ${w} kg)`,
    frequency: rule.frequency,
    duration: rule.duration,
    quantity: rule.frequency?.includes('12h') ? 14 : 10,
  };
};

const protocolToRecommendation = (protocol, catalog, context = {}) => {
  const medName = protocol.medication || protocol.name;
  const cat = findCatalogMed(catalog, medName);
  const weightKg = context.weightKg;
  const dose = weightKg ? calculateLocalDose(medName, weightKg) : null;

  const stockQty = cat?.stockQty ?? protocol.stockQty;
  const minStock = cat?.minStock ?? 0;
  const lowStock = stockQty != null && minStock != null && stockQty <= minStock;

  const schedule = normalizeScheduleFields({
    dosage: dose?.dosage || protocol.dosage || protocol.defaultDosage || '',
    frequency: dose?.frequency || protocol.frequency || protocol.defaultFrequency || '1×/jour',
    duration: dose?.duration || protocol.duration || protocol.defaultDuration || '7 jours',
  });

  return {
    id: `${protocol.disease}-${medName}`.replace(/\s+/g, '-').toLowerCase(),
    medicationId: cat?.id || protocol.medicationId || null,
    name: cat?.name || medName,
    disease: protocol.disease,
    dosage: schedule.dosage,
    frequency: schedule.frequency,
    duration: schedule.duration,
    quantity: dose?.quantity ?? protocol.quantity ?? protocol.defaultQuantity ?? 1,
    unit: protocol.unit || cat?.unit || 'cp',
    rationale: protocol.rationale || `Protocole ${protocol.disease}`,
    priority: protocol.priority || 'medium',
    confidence: protocol.confidence || 'Élevée',
    stockQty,
    minStock,
    lowStock: Boolean(lowStock || cat?.lowStock),
    inStock: stockQty == null || stockQty > 0,
    score: 0,
  };
};

/**
 * @param {object} input
 * @param {string} input.diagnosis
 * @param {string} [input.symptoms]
 * @param {string} [input.animalType]
 * @param {number} [input.weightKg]
 * @param {Array} [catalog]
 */
export const buildMedicationRecommendations = (input = {}, catalog = DEMO_VET_PHARMACY_MEDS) => {
  const diagnosis = [input.diagnosis, input.symptoms].filter(Boolean).join(' ');
  const diseases = inferDiseasesFromText(diagnosis);
  const animalType = input.animalType;

  const protocols = [
    ...(DEMO_VET_BI.diseaseTreatments || []).map((dt) => ({
      disease: dt.disease,
      animalTypes: dt.animalTypes,
      medication: dt.medication,
      dosage: dt.dosage,
      frequency: dt.frequency,
      duration: dt.duration,
      quantity: dt.quantity,
      unit: dt.unit,
      stockQty: dt.stockQty,
      rationale: `Protocole BI — ${dt.disease}`,
    })),
    ...EXTRA_PROTOCOLS,
  ];

  const matched = protocols.filter((p) => {
    const diseaseMatch = diseases.length === 0 ||
      diseases.some((d) => normalize(p.disease).includes(normalize(d)) || normalize(d).includes(normalize(p.disease)));
    return diseaseMatch && matchesAnimal(p.animalTypes, animalType);
  });

  const seen = new Set();
  const recommendations = matched
    .map((p) => protocolToRecommendation(p, catalog, input))
    .filter((r) => {
      const k = r.name.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .map((r) => {
      let score = 50;
      if (diseases.some((d) => normalize(r.disease).includes(normalize(d)))) score += 30;
      if (r.priority === 'high') score += 15;
      if (r.inStock && !r.lowStock) score += 10;
      else if (r.lowStock) score += 5;
      else if (!r.inStock) score -= 20;
      if (input.weightKg && r.dosage.includes('mg/kg')) score += 5;
      return { ...r, score };
    })
    .sort((a, b) => b.score - a.score);

  return {
    diseases,
    recommendations,
    disclaimer:
      'Recommandations indicatives — validation et prescription sous responsabilité du vétérinaire.',
  };
};

export const mergeApiRecommendations = (local = [], apiMeds = []) => {
  const byName = new Map(local.map((r) => [normalize(r.name), r]));
  (apiMeds || []).forEach((m) => {
    const key = normalize(m.name);
    const existing = byName.get(key);
    if (existing) {
      byName.set(key, {
        ...existing,
        dosage: m.dosage || existing.dosage,
        frequency: m.frequency || existing.frequency,
        duration: m.duration || existing.duration,
        quantity: m.quantity ?? existing.quantity,
        confidence: 'API + protocole',
        score: (existing.score || 0) + 15,
      });
    } else {
      byName.set(key, {
        id: `api-${key}`,
        name: m.name,
        medicationId: m.medicationId || null,
        dosage: m.dosage || '',
        frequency: m.frequency || '1×/jour',
        duration: m.duration || '7 jours',
        quantity: m.quantity ?? 1,
        disease: m.disease || 'Suggestion API',
        rationale: m.notes || m.rationale || 'Suggestion pharmacie / IA',
        confidence: 'API',
        score: 60,
        inStock: true,
        lowStock: false,
      });
    }
  });
  return [...byName.values()].sort((a, b) => (b.score || 0) - (a.score || 0));
};

export const recommendationToMedicationRow = (rec) => {
  const schedule = normalizeScheduleFields({
    dosage: rec.dosage,
    frequency: rec.frequency,
    duration: rec.duration,
  });
  return {
    name: rec.name,
    medicationId: rec.medicationId || '',
    dosage: schedule.dosage,
    frequency: schedule.frequency,
    duration: schedule.duration,
    quantity: rec.quantity,
    unit: rec.unit || 'mg',
  };
};
