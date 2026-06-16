import api from '../utils/api';
import {
  DEMO_CLINICAL_ANALYSIS,
  DEMO_PATIENT_CONTEXT,
  DEMO_VET_HISTORY,
  DEMO_VET_CONTACT_REQUESTS,
  mergeVetClients,
} from '../utils/vetDemoData';
import {
  analyzeSymptomsForDiagnosis,
  analyzeMedicalDossier,
  generatePrescriptionSuggestions,
  predictFollowUpNeeds,
  buildHealthEvolutionSeries,
  recommendNutritionForPathology,
  draftMedicalReport,
  enrichVetIntelligencePack,
} from '../utils/vetClinicalIntelligenceEngine';

export const VET_CLINICAL_QUICK_PROMPTS = [
  'Rédiger un compte rendu de consultation dermatologique',
  'Expliquer au propriétaire les signes d\'alerte post-vaccination',
  'Proposer un message de rappel contrôle arthrose',
  'Résumer les contre-indications AINS chez le chien',
];

const buildDemoPatients = () => [
  {
    id: 'p-mimi',
    petName: 'Mimi',
    ownerName: 'Ines Trabelsi',
    ownerId: 'demo-client-2',
    type: 'cat',
    weightKg: 4.5,
    chronicCondition: 'Dermatite allergique',
    daysSinceLastVisit: 12,
    symptomsPending: 'Grattage persistant',
    nextVisitDays: 14,
    priority: 'high',
  },
  {
    id: 'p-rex',
    petName: 'Rex',
    ownerName: 'Youssef Gharbi',
    ownerId: 'demo-client-3',
    type: 'dog',
    weightKg: 28,
    chronicCondition: 'Arthrose débutante',
    daysSinceLastVisit: 90,
    riskObesity: false,
    nextVisitDays: 30,
    priority: 'medium',
  },
  {
    id: 'p-max',
    petName: 'Max',
    ownerName: 'Sami Ben Ali',
    ownerId: 'demo-client-1',
    type: 'dog',
    weightKg: 12,
    daysSinceLastVisit: 45,
    overdueVaccine: false,
    nextVisitDays: 60,
    priority: 'low',
  },
  {
    id: 'p-simba',
    petName: 'Simba',
    ownerName: 'Nadia Khalfallah',
    ownerId: 'demo-client-4',
    type: 'cat',
    weightKg: 3.8,
    daysSinceLastVisit: 2,
    symptomsPending: 'Vomissements depuis 2 jours',
    nextVisitDays: 3,
    priority: 'high',
  },
];

export async function loadVetIntelligenceHubPack() {
  let mode = 'demo';
  let clients = mergeVetClients([]);
  let consultations = DEMO_VET_HISTORY.consultations;
  let contactRequests = DEMO_VET_CONTACT_REQUESTS;

  try {
    const [clientsRes, historyRes] = await Promise.all([
      api.get('/vet/clients').catch(() => null),
      api.get('/vet/history').catch(() => null),
    ]);
    if (clientsRes?.data?.length) {
      clients = mergeVetClients(clientsRes.data);
      mode = 'live';
    }
    if (historyRes?.data?.consultations?.length) {
      consultations = historyRes.data.consultations;
    }
  } catch {
    /* démo */
  }

  const patients = buildDemoPatients();
  const selectedPet = patients[0];

  const pack = enrichVetIntelligencePack({
    mode,
    clients,
    patients,
    selectedPet,
    dossier: {
      ...DEMO_PATIENT_CONTEXT.dossier,
      petName: selectedPet.petName,
    },
    timeline: DEMO_PATIENT_CONTEXT.timeline,
    consultations,
    contactRequests,
    clinicalAnalysis: DEMO_CLINICAL_ANALYSIS,
    ownerNotes: contactRequests[0]?.message || '',
    quickPrompts: VET_CLINICAL_QUICK_PROMPTS,
  });

  return pack;
}

export async function runDiagnosticAnalysis({ symptoms, pet, ownerNotes }) {
  try {
    const { data } = await api.post('/vet/ml/diagnostic-assist', { symptoms, pet, ownerNotes });
    if (data?.diagnosticHypotheses?.length) return { ...data, source: 'api' };
  } catch {
    /* local */
  }
  return { ...analyzeSymptomsForDiagnosis({ symptoms, pet, ownerNotes }), source: 'local' };
}

export async function runPrescriptionAssist(input) {
  try {
    const { data } = await api.post('/vet/ml/prescription-assist', input);
    if (data?.medications?.length) return { ...data, source: 'api' };
  } catch {
    /* local */
  }
  return { ...generatePrescriptionSuggestions(input), source: 'local' };
}

export async function runNutritionPathology(input) {
  try {
    const { data } = await api.post('/vet/ml/nutrition-pathology', input);
    if (data?.plans?.length) return { ...data, source: 'api' };
  } catch {
    /* local */
  }
  return { ...recommendNutritionForPathology(input), source: 'local' };
}

export async function generateClinicalReport(input) {
  return draftMedicalReport(input);
}

export {
  analyzeSymptomsForDiagnosis,
  analyzeMedicalDossier,
  generatePrescriptionSuggestions,
  predictFollowUpNeeds,
  buildHealthEvolutionSeries,
  recommendNutritionForPathology,
  draftMedicalReport,
};

export default loadVetIntelligenceHubPack;
