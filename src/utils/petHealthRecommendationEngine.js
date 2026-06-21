import {
  COMMON_SYMPTOMS,
  CHRONIC_DISEASES,
  TREATMENT_PROTOCOLS,
  VACCINE_SCHEDULE,
  TREATMENT_TYPES,
} from '../config/petHealthRecommendationCatalog';
import { analyzeSymptomsForDiagnosis } from './vetClinicalIntelligenceEngine';
import { buildMedicationRecommendations, calculateLocalDose } from './vetMedicationRecommender';

const normalize = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const matchesPetType = (allowed, petType) => {
  if (!petType || !allowed?.length) return true;
  const t = normalize(petType);
  return allowed.some((a) => normalize(a) === t || t.includes(normalize(a)));
};

/** Détecte les symptômes depuis texte libre + sélection. */
export const detectSymptoms = (symptomText = '', selectedIds = []) => {
  const text = normalize(symptomText);
  const detected = new Set(selectedIds);

  COMMON_SYMPTOMS.forEach((s) => {
    if (selectedIds.includes(s.id)) return;
    if (s.keywords.some((kw) => text.includes(normalize(kw)))) detected.add(s.id);
  });

  return COMMON_SYMPTOMS.filter((s) => detected.has(s.id));
};

/** Détecte maladies chroniques probables. */
export const detectChronicConditions = ({
  pet = {},
  symptomText = '',
  selectedSymptoms = [],
  knownChronic = [],
} = {}) => {
  const text = normalize(`${symptomText} ${knownChronic.join(' ')}`);
  const symptomIds = detectSymptoms(symptomText, selectedSymptoms).map((s) => s.id);
  const petType = pet.type || pet.petType || 'dog';

  const matches = CHRONIC_DISEASES.filter((d) => {
    if (!matchesPetType(d.petTypes, petType)) return false;
    const keywordHit = d.keywords.some((kw) => text.includes(normalize(kw)));
    const symptomHit = d.symptoms.some((sid) => symptomIds.includes(sid));
    const knownHit = knownChronic.some((k) => normalize(k).includes(normalize(d.name)) || normalize(d.name).includes(normalize(k)));
    return keywordHit || (symptomHit && d.chronic) || knownHit;
  });

  return matches.map((d) => ({
    ...d,
    confidence: knownChronic.some((k) => normalize(k).includes(normalize(d.name)))
      ? 'Confirmée'
      : d.keywords.some((kw) => text.includes(normalize(kw)))
        ? 'Probable'
        : 'À surveiller',
    source: 'chronic_engine',
  }));
};

/** Recommandations vaccinales selon espèce et retard. */
export const recommendVaccines = (pet = {}, overdue = []) => {
  const petType = pet.type || pet.petType || 'dog';
  return VACCINE_SCHEDULE
    .filter((v) => matchesPetType(v.petTypes, petType))
    .map((v) => {
      const isOverdue = overdue.some((o) => normalize(o).includes(normalize(v.name)));
      return {
        ...v,
        type: 'vaccin',
        typeMeta: TREATMENT_TYPES.vaccin,
        priority: v.mandatory || isOverdue ? 'high' : 'medium',
        status: isOverdue ? 'En retard' : v.nextDueDays <= 60 ? 'À prévoir' : 'À jour',
        rationale: v.description,
      };
    });
};

/** Protocoles traitement (médicaments, gélules, compléments). */
export const buildTreatmentRecommendations = ({
  diseases = [],
  chronicConditions = [],
  pet = {},
  catalogProtocols = TREATMENT_PROTOCOLS,
} = {}) => {
  const petType = pet.type || pet.petType || 'dog';
  const weightKg = pet.weightKg || pet.weight;
  const diseaseNames = [
    ...diseases.map((d) => (typeof d === 'string' ? d : d.condition || d.name)),
    ...chronicConditions.map((c) => c.name),
  ].filter(Boolean);

  const normalizedDiseases = diseaseNames.map(normalize);

  const fromCatalog = catalogProtocols
    .filter((p) => {
      if (!matchesPetType(p.petTypes, petType)) return false;
      return p.diseases.some((dis) => {
        const nd = normalize(dis);
        return normalizedDiseases.some((dn) => dn.includes(nd) || nd.includes(dn));
      });
    })
    .map((p) => {
      const dose = weightKg ? calculateLocalDose(p.name, weightKg) : null;
      return {
        id: p.id,
        name: p.name,
        type: p.type,
        typeMeta: TREATMENT_TYPES[p.type] || TREATMENT_TYPES.medicament,
        dosage: dose?.dosage || p.dosage,
        frequency: dose?.frequency || p.frequency,
        duration: dose?.duration || p.duration,
        rationale: p.rationale,
        priority: p.priority || 'medium',
        otc: p.otc,
        diseases: p.diseases,
        score: p.priority === 'high' ? 85 : p.priority === 'medium' ? 70 : 55,
      };
    });

  const medPack = buildMedicationRecommendations({
    diagnosis: diseaseNames.join(', '),
    symptoms: diseaseNames.join(', '),
    animalType: petType,
    weightKg,
  });

  const fromMeds = (medPack.recommendations || []).map((r) => ({
    id: r.id,
    name: r.name,
    type: r.unit === 'cp' || r.unit === 'gélule' ? 'gelule' : 'medicament',
    typeMeta: TREATMENT_TYPES[r.unit === 'cp' ? 'gelule' : 'medicament'],
    dosage: r.dosage,
    frequency: r.frequency,
    duration: r.duration,
    rationale: r.rationale,
    priority: r.priority || 'medium',
    otc: false,
    inStock: r.inStock,
    lowStock: r.lowStock,
    score: r.score || 60,
    diseases: [r.disease],
  }));

  const seen = new Set();
  return [...fromCatalog, ...fromMeds]
    .filter((t) => {
      const k = normalize(t.name);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .sort((a, b) => (b.score || 0) - (a.score || 0));
};

/** Analyse complète — symptômes, chroniques, traitements, vaccins. */
export const analyzePetHealthRecommendations = (input = {}) => {
  const pet = input.pet || {};
  const symptomText = [input.symptoms, input.ownerNotes].filter(Boolean).join('. ');
  const selectedSymptoms = input.selectedSymptoms || [];

  const detectedSymptoms = detectSymptoms(symptomText, selectedSymptoms);
  const diagnosis = analyzeSymptomsForDiagnosis({
    symptoms: symptomText,
    pet,
    ownerNotes: input.ownerNotes || '',
  });

  const chronicConditions = detectChronicConditions({
    pet,
    symptomText,
    selectedSymptoms: detectedSymptoms.map((s) => s.id),
    knownChronic: input.knownChronic || pet.chronicConditions || [],
  });

  const diseases = [
    ...(diagnosis.diagnosticHypotheses || []).map((h) => h.condition),
    ...chronicConditions.map((c) => c.name),
  ];

  const treatments = buildTreatmentRecommendations({
    diseases,
    chronicConditions,
    pet,
  });

  const vaccines = recommendVaccines(pet, input.overdueVaccines || pet.overdueVaccines || []);

  const urgent = diagnosis.urgency === 'urgent' || chronicConditions.some((c) => c.confidence === 'Confirmée' && ['cardiaque', 'diabete', 'insuffisance-renale'].includes(c.id));

  const summary = [
    detectedSymptoms.length ? `${detectedSymptoms.length} symptôme(s) détecté(s)` : null,
    chronicConditions.length ? `${chronicConditions.length} pathologie(s) chronique(s) identifiée(s)` : null,
    treatments.length ? `${treatments.length} traitement(s) recommandé(s)` : null,
    vaccines.filter((v) => v.status !== 'À jour').length ? `${vaccines.filter((v) => v.status !== 'À jour').length} vaccin(s) à planifier` : null,
  ].filter(Boolean).join(' · ');

  return {
    petName: pet.name || pet.petName || 'Animal',
    petType: pet.type || pet.petType || 'dog',
    detectedSymptoms,
    diagnosis,
    chronicConditions,
    treatments: treatments.slice(0, 12),
    vaccines,
    urgency: diagnosis.urgency,
    urgencyLabel: diagnosis.urgencyLabel,
    requiresVet: urgent || treatments.some((t) => !t.otc && t.priority === 'high'),
    aiSummary: summary || diagnosis.aiSummary,
    disclaimer: 'Recommandations indicatives — ne remplace pas un diagnostic vétérinaire. Consultation obligatoire pour prescription.',
    analyzedAt: new Date().toISOString(),
  };
};

export default {
  detectSymptoms,
  detectChronicConditions,
  recommendVaccines,
  buildTreatmentRecommendations,
  analyzePetHealthRecommendations,
};
