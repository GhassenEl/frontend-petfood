/** Données de démonstration lorsque l'API renvoie des listes vides (espace vétérinaire). */

export const withDemoFallback = (data, demo) => {
  if (Array.isArray(data) && data.length > 0) return data;
  return demo;
};

const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();
const hoursFromNow = (h) => new Date(Date.now() + h * 3600000).toISOString();
const daysFromNow = (n) => new Date(Date.now() + n * 86400000).toISOString();

export const DEMO_VET_CLIENTS = [
  {
    id: 'demo-client-1',
    _id: 'demo-client-1',
    name: 'Sami Ben Ali',
    email: 'client@petfood.tn',
    phone: '+216 22 111 222',
    address: '12 Avenue Habib Bourguiba',
    city: 'La Marsa, Tunis',
    since: '2023-03-15',
    notes: 'Client fidèle — préfère les RDV en matinée. 2 animaux suivis.',
    appointmentCount: 8,
    consultationCount: 6,
    pets: [
      { id: 'pet-max', name: 'Max', type: 'dog', breed: 'Berger allemand', ageYears: 5, weightKg: 32, sex: 'M', lastVisit: daysAgo(45) },
      { id: 'pet-luna', name: 'Luna', type: 'cat', breed: 'Européen', ageYears: 3, weightKg: 4.2, sex: 'F', lastVisit: daysAgo(120) },
    ],
  },
  {
    id: 'demo-client-2',
    _id: 'demo-client-2',
    name: 'Ines Trabelsi',
    email: 'ines.trabelsi@email.tn',
    phone: '+216 98 333 444',
    address: '45 Rue de l\'Indépendance',
    city: 'Ariana',
    since: '2024-01-08',
    notes: 'Allergie alimentaire connue chez Mimi (poulet).',
    appointmentCount: 5,
    consultationCount: 4,
    pets: [{ id: 'pet-mimi', name: 'Mimi', type: 'cat', breed: 'Siamois', ageYears: 2, weightKg: 3.8, sex: 'F', lastVisit: daysAgo(12) }],
  },
  {
    id: 'demo-client-3',
    _id: 'demo-client-3',
    name: 'Youssef Gharbi',
    email: 'youssef.gharbi@email.tn',
    phone: '+216 55 777 888',
    address: 'Résidence Les Jasmins, Bloc B',
    city: 'Lac 1, Tunis',
    since: '2022-11-20',
    notes: 'Demande souvent des visites à domicile pour Rex (mobilité réduite).',
    appointmentCount: 12,
    consultationCount: 10,
    pets: [{ id: 'pet-rex', name: 'Rex', type: 'dog', breed: 'Labrador', ageYears: 8, weightKg: 28, sex: 'M', lastVisit: daysAgo(90) }],
  },
  {
    id: 'demo-client-4',
    _id: 'demo-client-4',
    name: 'Nadia Khalfallah',
    email: 'nadia.k@email.tn',
    phone: '+216 27 444 555',
    address: '8 Rue Sidi Bou Said',
    city: 'Carthage',
    since: '2025-09-01',
    notes: 'Nouvelle cliente — premier RDV pour Simba (vomissements).',
    appointmentCount: 1,
    consultationCount: 0,
    pets: [{ id: 'pet-simba', name: 'Simba', type: 'cat', breed: 'Maine Coon', ageYears: 4, weightKg: 5.1, sex: 'M', lastVisit: null }],
  },
];

const apptDate = (dayOffset, hour, minute = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

export const DEMO_VET_APPOINTMENTS = [
  {
    id: 'vet-appt-1',
    _id: 'vet-appt-1',
    petName: 'Max',
    animalType: 'dog',
    status: 'confirmed',
    date: apptDate(0, 10, 0),
    visitMode: 'clinic',
    owner: { name: 'Sami Ben Ali', id: 'demo-client-1' },
    reason: 'Contrôle annuel + vaccin rage',
  },
  {
    id: 'vet-appt-2',
    _id: 'vet-appt-2',
    petName: 'Mimi',
    animalType: 'cat',
    status: 'scheduled',
    date: apptDate(0, 14, 30),
    visitMode: 'clinic',
    owner: { name: 'Ines Trabelsi', id: 'demo-client-2' },
    reason: 'Dermatite — suivi',
  },
  {
    id: 'vet-appt-3',
    _id: 'vet-appt-3',
    petName: 'Rex',
    animalType: 'dog',
    status: 'pending',
    date: apptDate(1, 9, 0),
    visitMode: 'home',
    owner: { name: 'Youssef Gharbi', id: 'demo-client-3' },
    reason: 'Boiterie patte avant',
  },
  {
    id: 'vet-appt-4',
    _id: 'vet-appt-4',
    petName: 'Luna',
    animalType: 'cat',
    status: 'confirmed',
    date: apptDate(2, 11, 0),
    visitMode: 'online',
    owner: { name: 'Sami Ben Ali', id: 'demo-client-1' },
    reason: 'Téléconsultation post-op',
  },
  {
    id: 'vet-appt-5',
    _id: 'vet-appt-5',
    petName: 'Max',
    animalType: 'dog',
    status: 'scheduled',
    date: apptDate(4, 16, 0),
    visitMode: 'clinic',
    owner: { name: 'Sami Ben Ali', id: 'demo-client-1' },
    reason: 'Rappel antiparasitaire',
  },
];

export const DEMO_VET_UNASSIGNED = [
  {
    id: 'vet-appt-u1',
    _id: 'vet-appt-u1',
    petName: 'Simba',
    animalType: 'cat',
    status: 'pending',
    date: apptDate(1, 15, 0),
    visitMode: 'clinic',
    owner: { name: 'Nadia K.' },
    reason: 'Vomissements récurrents',
  },
];

export const DEMO_VET_DASHBOARD = {
  todayAppointments: 2,
  pendingAppointments: 3,
  pendingContactRequests: 1,
  totalConsultations: 186,
  totalPrescriptions: 142,
  unassignedCount: 1,
  clinic: {
    clinicName: 'Clinique VetCare Tunis',
    region: 'Grand Tunis',
    acceptsHomeVisit: true,
    acceptsTeleconsult: true,
  },
  clinicStats: {
    activePatients: 48,
    dossiersCount: 52,
    signedEntriesCount: 128,
    vaccinesDueSoon: 6,
  },
  weekStats: {
    consultations: 14,
    prescriptions: 11,
    completedAppointments: 9,
  },
  todayList: DEMO_VET_APPOINTMENTS.filter((a) => {
    const d = new Date(a.date);
    const t = new Date();
    return d.toDateString() === t.toDateString();
  }),
  upcomingAppointments: DEMO_VET_APPOINTMENTS.filter((a) => new Date(a.date) > new Date()).slice(0, 5),
  unassignedPreview: DEMO_VET_UNASSIGNED,
  draftEntries: [
    {
      id: 'draft-1',
      title: 'Consultation dermatologie',
      dossier: { id: 'doss-mimi', petName: 'Mimi', dossierNumber: 'DMP-2026-0042' },
    },
  ],
  clinicalAlerts: [
    { level: 'warning', message: '6 vaccins à prévoir sous 30 jours', link: '/vet/vaccinations' },
    { level: 'critical', message: 'Rupture : Collyre antibiotique (0 flacon)', link: '/vet/pharmacy' },
    { level: 'warning', message: 'Stock bas : Antiparasitaire chat (3 unités)', link: '/vet/pharmacy' },
    { level: 'warning', message: 'Péremption proche : Antihistaminique chien (12 j)', link: '/vet/pharmacy' },
    { level: 'critical', message: '1 RDV non assigné dans le pool', link: '/vet/calendar' },
  ],
  pharmacySummary: { ruptures: 1, lowStock: 2, expiry: 1 },
  weekChart: [
    { name: 'Lun', rdv: 4, consultations: 3 },
    { name: 'Mar', rdv: 5, consultations: 4 },
    { name: 'Mer', rdv: 3, consultations: 2 },
    { name: 'Jeu', rdv: 6, consultations: 5 },
    { name: 'Ven', rdv: 4, consultations: 3 },
    { name: 'Sam', rdv: 2, consultations: 1 },
    { name: 'Dim', rdv: 1, consultations: 0 },
  ],
  statusChart: [
    { name: 'Planifié', value: 4 },
    { name: 'Confirmé', value: 6 },
    { name: 'Terminé', value: 9 },
    { name: 'Annulé', value: 1 },
  ],
};

export const buildDemoVetWeekChart = (appointments = DEMO_VET_APPOINTMENTS) => {
  const days = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toDateString();
    days.push({
      key,
      name: d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
      rdv: 0,
      consultations: 0,
    });
  }
  const byKey = Object.fromEntries(days.map((day) => [day.key, day]));
  appointments.forEach((a) => {
    const key = new Date(a.date).toDateString();
    if (byKey[key]) {
      byKey[key].rdv += 1;
      if (a.status === 'completed') byKey[key].consultations += 1;
    }
  });
  if (days.every((d) => d.rdv === 0)) return DEMO_VET_DASHBOARD.weekChart;
  return days.map(({ name, rdv, consultations }) => ({ name, rdv, consultations }));
};

export const DEMO_VET_MEDICAL_DOSSIERS = [
  {
    id: 'doss-max',
    _id: 'doss-max',
    dossierNumber: 'DMP-2026-0038',
    petName: 'Max',
    animalType: 'dog',
    status: 'active',
    owner: { name: 'Sami Ben Ali', id: 'demo-client-1' },
    allergies: 'Aucune connue',
    lastVisit: daysAgo(45),
    entriesCount: 8,
  },
  {
    id: 'doss-mimi',
    _id: 'doss-mimi',
    dossierNumber: 'DMP-2026-0042',
    petName: 'Mimi',
    animalType: 'cat',
    status: 'active',
    owner: { name: 'Ines Trabelsi', id: 'demo-client-2' },
    allergies: 'Poulet',
    lastVisit: daysAgo(12),
    entriesCount: 5,
  },
  {
    id: 'doss-rex',
    _id: 'doss-rex',
    dossierNumber: 'DMP-2026-0051',
    petName: 'Rex',
    animalType: 'dog',
    status: 'active',
    owner: { name: 'Youssef Gharbi', id: 'demo-client-3' },
    lastVisit: daysAgo(90),
    entriesCount: 12,
  },
];

export const DEMO_VET_VACCINATIONS = [
  {
    id: 'vac-1',
    petName: 'Max',
    owner: { name: 'Sami Ben Ali' },
    animalType: 'dog',
    vaccineType: 'Rage',
    dateAdministered: daysAgo(340),
    nextDue: daysFromNow(25),
    status: 'up_to_date',
  },
  {
    id: 'vac-2',
    petName: 'Mimi',
    owner: { name: 'Ines Trabelsi' },
    animalType: 'cat',
    vaccineType: 'Typhus / Coryza',
    dateAdministered: daysAgo(400),
    nextDue: daysAgo(5),
    status: 'overdue',
  },
  {
    id: 'vac-3',
    petName: 'Rex',
    owner: { name: 'Youssef Gharbi' },
    animalType: 'dog',
    vaccineType: 'CHPPiL',
    dateAdministered: daysAgo(180),
    nextDue: daysFromNow(12),
    status: 'up_to_date',
  },
  {
    id: 'vac-4',
    petName: 'Luna',
    owner: { name: 'Sami Ben Ali' },
    animalType: 'cat',
    vaccineType: 'Rage chat',
    dateAdministered: daysAgo(300),
    nextDue: daysFromNow(18),
    status: 'up_to_date',
  },
];

export const DEMO_VET_PHARMACY_MEDS = [
  { id: 'med-1', name: 'Antiparasitaire chat spot-on', stockQty: 3, minStock: 10, unit: 'flacon', lowStock: true, location: 'Stock clinique', treatments: [{ disease: 'Parasites externes' }] },
  { id: 'med-2', name: 'Amoxicilline 500 mg', stockQty: 24, minStock: 8, unit: 'cp', pharmacy: 'Stock clinique', treatments: [{ disease: 'Infection cutanée' }] },
  { id: 'med-3', name: 'Anti-inflammatoire chien', stockQty: 18, minStock: 6, unit: 'cp', pharmacy: 'Stock clinique', treatments: [{ disease: 'Arthrose' }] },
  { id: 'med-4', name: 'Vaccin rage chien', stockQty: 12, minStock: 5, unit: 'dose', pharmacy: 'Réfrigérateur A', treatments: [{ disease: 'Prévention rage' }] },
  { id: 'med-5', name: 'Shampoing dermatologique', stockQty: 9, minStock: 4, unit: 'flacon', pharmacy: 'Stock clinique', treatments: [{ disease: 'Dermatite' }] },
  { id: 'med-6', name: 'Collyre antibiotique', stockQty: 0, minStock: 4, unit: 'flacon', pharmacy: 'Armoire A', treatments: [{ disease: 'Conjonctivite' }] },
  { id: 'med-7', name: 'Antihistaminique chien', stockQty: 2, minStock: 6, unit: 'cp', pharmacy: 'Stock clinique', expiryDate: new Date(Date.now() + 12 * 86400000).toISOString(), treatments: [{ disease: 'Allergie' }] },
];

export const DEMO_VET_PHARMACY_ALERTS = DEMO_VET_PHARMACY_MEDS
  .filter((m) => m.lowStock || m.stockQty <= 0 || m.expiryDate)
  .map((m) => ({
    id: m.id,
    name: m.name,
    stockQty: m.stockQty,
    minStock: m.minStock,
    unit: m.unit,
    status: m.stockQty <= 0 ? 'rupture' : 'stock_bas',
    level: m.stockQty <= 0 ? 'critical' : 'warning',
    label: m.stockQty <= 0 ? 'Rupture' : 'Stock bas',
    message: m.stockQty <= 0
      ? `${m.name} — rupture de stock`
      : `${m.name} — ${m.stockQty} ${m.unit} (min ${m.minStock})`,
    link: '/vet/pharmacy',
  }));

export const DEMO_VET_BI = {
  summary: {
    totalCases: 48,
    casesThisMonth: 12,
    totalDiseases: 15,
    mappingCount: 22,
    totalMedications: 34,
    stockValue: 4280,
    lowStock: 3,
  },
  insights: [
    'Pic de consultations dermatologiques chez le chat (+18 % vs mois dernier).',
    '3 références en stock bas — réapprovisionnement recommandé cette semaine.',
    'Vaccins rage : 6 rappels à planifier avant fin du mois.',
  ],
  casesByMonth: [
    { label: 'Jan', count: 6 },
    { label: 'Fév', count: 8 },
    { label: 'Mar', count: 7 },
    { label: 'Avr', count: 9 },
    { label: 'Mai', count: 10 },
    { label: 'Juin', count: 8 },
  ],
  animalDistribution: [
    { animal: 'Chien', count: 28, percent: 58 },
    { animal: 'Chat', count: 17, percent: 35 },
    { animal: 'Autre', count: 3, percent: 7 },
  ],
  diseaseByAnimal: [
    { animal: 'Chien', disease: 'Arthrose', count: 8, percent: 17 },
    { animal: 'Chien', disease: 'Dermatite', count: 6, percent: 13 },
    { animal: 'Chat', disease: 'Typhus / Coryza', count: 5, percent: 10 },
    { animal: 'Chat', disease: 'Dermatite allergique', count: 7, percent: 15 },
    { animal: 'Chien', disease: 'Otite', count: 4, percent: 8 },
    { animal: 'Chat', disease: 'Parasites externes', count: 5, percent: 10 },
  ],
  topMedications: [
    { name: 'Anti-inflammatoire chien', cases: 12, totalQty: 48 },
    { name: 'Antiparasitaire chat', cases: 10, totalQty: 10 },
    { name: 'Amoxicilline', cases: 9, totalQty: 36 },
    { name: 'Shampoing dermatologique', cases: 7, totalQty: 7 },
  ],
  missingMedications: [
    { name: 'Antiparasitaire chat spot-on', reason: 'stock_bas', stockQty: 3, minStock: 10 },
    { name: 'Collyre antibiotique', reason: 'absent_catalogue' },
  ],
  recentImports: [
    { id: 'restock-1', pharmacy: 'Stock clinique VetCare', itemsCount: 12, createdAt: daysAgo(2) },
    { id: 'restock-2', pharmacy: 'Armoire pharmacie A', itemsCount: 8, createdAt: daysAgo(7) },
    { id: 'restock-3', pharmacy: 'Réfrigérateur vaccins', itemsCount: 5, createdAt: daysAgo(14) },
  ],
  diseaseTreatments: [
    { id: 'dt-1', disease: 'Dermatite allergique', animalTypes: 'Chat', medication: 'Shampoing dermatologique', dosage: '1 application', frequency: '1×/semaine', duration: '30 jours', quantity: 1, unit: 'flacon', stockQty: 9, pharmacy: 'Stock clinique' },
    { id: 'dt-2', disease: 'Arthrose', animalTypes: 'Chien', medication: 'Anti-inflammatoire chien', dosage: '1 cp / 20 kg', frequency: '1×/jour', duration: '10 jours', quantity: 10, unit: 'cp', stockQty: 18, pharmacy: 'Stock clinique' },
    { id: 'dt-3', disease: 'Infection cutanée', animalTypes: 'Chien, Chat', medication: 'Amoxicilline 500 mg', dosage: '12 mg/kg', frequency: '2×/12h', duration: '7 jours', quantity: 14, unit: 'cp', stockQty: 24, pharmacy: 'Stock clinique' },
    { id: 'dt-4', disease: 'Parasites externes', animalTypes: 'Chat', medication: 'Antiparasitaire spot-on', dosage: '1 pipette', frequency: '1×/semaine', duration: '30 jours', quantity: 3, unit: 'dose', stockQty: 3, pharmacy: 'Stock clinique' },
    { id: 'dt-5', disease: 'Prévention rage', animalTypes: 'Chien, Chat', medication: 'Vaccin rage', dosage: '1 dose', frequency: 'Annuel', duration: '—', quantity: 1, unit: 'dose', stockQty: 12, pharmacy: 'Réfrigérateur A' },
  ],
  casesWithMeds: [
    { id: 'case-1', animalType: 'Chat', petName: 'Mimi', diagnosis: 'Dermatite allergique', medications: [{ name: 'Shampoing dermatologique', quantity: 1 }], source: 'Consultation' },
    { id: 'case-2', animalType: 'Chien', petName: 'Rex', diagnosis: 'Arthrose débutante', medications: [{ name: 'Anti-inflammatoire chien', quantity: 10 }], source: 'Consultation' },
    { id: 'case-3', animalType: 'Chien', petName: 'Max', diagnosis: 'Contrôle annuel', medications: [{ name: 'Vaccin rage', quantity: 1 }], source: 'Vaccination' },
    { id: 'case-4', animalType: 'Chat', petName: 'Luna', diagnosis: 'Parasites externes', medications: [{ name: 'Antiparasitaire spot-on', quantity: 1 }], source: 'Consultation' },
  ],
};

export const mergeVetBiData = (apiData) => {
  if (!apiData) return DEMO_VET_BI;
  return {
    ...DEMO_VET_BI,
    ...apiData,
    summary: { ...DEMO_VET_BI.summary, ...(apiData.summary || {}) },
    insights: apiData.insights?.length ? apiData.insights : DEMO_VET_BI.insights,
    casesByMonth: apiData.casesByMonth?.length ? apiData.casesByMonth : DEMO_VET_BI.casesByMonth,
    animalDistribution: apiData.animalDistribution?.length ? apiData.animalDistribution : DEMO_VET_BI.animalDistribution,
    diseaseByAnimal: apiData.diseaseByAnimal?.length ? apiData.diseaseByAnimal : DEMO_VET_BI.diseaseByAnimal,
    topMedications: apiData.topMedications?.length ? apiData.topMedications : DEMO_VET_BI.topMedications,
    missingMedications: apiData.missingMedications?.length ? apiData.missingMedications : DEMO_VET_BI.missingMedications,
    recentImports: apiData.recentImports?.length ? apiData.recentImports : DEMO_VET_BI.recentImports,
    diseaseTreatments: apiData.diseaseTreatments?.length ? apiData.diseaseTreatments : DEMO_VET_BI.diseaseTreatments,
    casesWithMeds: apiData.casesWithMeds?.length ? apiData.casesWithMeds : DEMO_VET_BI.casesWithMeds,
  };
};

export const withDemoDashboard = (data) => {
  if (data?.todayList?.length || data?.stats?.todayAppointments > 0) return data;
  if (data?.clinic?.clinicName && data?.todayAppointments > 0) return data;
  if (data?.todayAppointments > 0) return { ...DEMO_VET_DASHBOARD, ...data };
  return DEMO_VET_DASHBOARD;
};

export const DEMO_PATIENT_CONTEXT = {
  dossier: {
    id: 'doss-mimi',
    dossierNumber: 'DMP-2026-0042',
    allergies: 'Allergie poulet — éviter protéines aviaires',
  },
  timeline: [
    { id: 'tl-1', type: 'consultation', date: daysAgo(12), label: 'Dermatite — shampoing prescrit' },
    { id: 'tl-2', type: 'vaccine', date: daysAgo(90), label: 'Rappel Typhus / Coryza' },
    { id: 'tl-3', type: 'prescription', date: daysAgo(12), label: 'Ordonnance dermatologique' },
  ],
  pastAnalyses: [
    { id: 'pa-1', urgencyClass: 'non_urgent', createdAt: daysAgo(12), summary: 'Dermatite légère — suivi local' },
  ],
};

export const DEMO_CLINICAL_ANALYSIS = {
  earlyDetection: {
    riskLevel: 'medium',
    riskLabel: 'Risque modéré',
    riskColor: '#f59e0b',
    riskScore: 42,
    diseaseProbability: 0.35,
    urgencyScore: 0.28,
    recommendedAction: 'Consultation sous 48 h recommandée',
    model: 'Référentiel clinique',
    summary: 'Signes compatibles avec une dermatite ou irritation cutanée. Surveillance des lésions et du comportement alimentaire.',
    symptomAnalysis: [
      { symptom: 'Grattage excessif', severity: 'Modérée', source: 'Saisie' },
      { symptom: 'Rougeurs zone ventrale', severity: 'Légère', source: 'Saisie' },
    ],
    earlyWarnings: [
      { message: 'Surveiller l\'apparition de plaies ou perte de poils localisée', priority: 'medium' },
    ],
    screeningRecommendations: [
      { test: 'Frottis cutané', reason: 'Exclure parasite ou infection secondaire' },
    ],
  },
  urgency: 'soon',
  urgencyClass: 'non_urgent',
  diseaseSuspected: false,
  profile: { pet: { name: 'Mimi', type: 'cat', ageYears: 2 } },
  anomalies: [
    { label: 'Prurit', severity: 'medium', description: 'Grattage répété depuis 5 jours', likelyDisease: true },
  ],
  diagnosticHypotheses: [
    { condition: 'Dermatite allergique alimentaire', confidence: 'Probable', rationale: 'Signes cutanés + antécédent allergie poulet' },
    { condition: 'Dermatite par allergie environnementale', confidence: 'Possible', rationale: 'Saison printanière — pollens' },
  ],
  recommendedMedications: [
    { name: 'Shampoing dermatologique', dosage: '1 application', frequency: '1×/semaine', duration: '30 jours', notes: 'Rincer abondamment' },
    { name: 'Antihistaminique chat', dosage: 'Selon poids', frequency: '1×/jour', duration: '7 jours' },
  ],
  recommendedVaccines: [],
  dietPlan: { summary: 'Régime hypoallergénique sans poulet — croquettes vétérinaires', recommendedFoods: ['Saumon', 'Agneau'] },
  healthFollowUp: { nextVisitDays: 14, monitoring: ['Grattage', 'Lésions cutanées'], warningSigns: ['Vomissements', 'Fièvre'] },
  clinicalNotes: 'Patient calme à l\'examen. Lésions érythémateuses zone ventrale. Pas de fièvre signalée.',
  followUpDays: 14,
  disclaimer: 'Aide à la décision clinique — confirmation et prescription sous responsabilité du vétérinaire.',
  analysisId: 'demo-analysis-1',
};

export const DEMO_VET_LEAVE_REQUESTS = [
  {
    id: 'leave-vet-1',
    _id: 'leave-vet-1',
    type: 'conge',
    startDate: '2026-08-10',
    endDate: '2026-08-15',
    reason: 'Congrès vétérinaire à Sfax — remplacement Dr. Sassi prévu.',
    status: 'pending',
  },
  {
    id: 'leave-vet-2',
    _id: 'leave-vet-2',
    type: 'maladie',
    startDate: '2026-04-02',
    endDate: '2026-04-03',
    reason: 'Indisposition — certificat médical transmis à l\'administration.',
    status: 'approved',
    adminNote: 'Validé — bon rétablissement.',
  },
  {
    id: 'leave-vet-3',
    _id: 'leave-vet-3',
    type: 'maladie',
    startDate: '2026-02-18',
    endDate: '2026-02-19',
    reason: 'Migraine sévère — impossible de tenir les consultations du matin.',
    status: 'approved',
    adminNote: 'Congé maladie enregistré.',
  },
  {
    id: 'leave-vet-4',
    _id: 'leave-vet-4',
    type: 'conge',
    startDate: '2026-12-22',
    endDate: '2026-12-31',
    reason: 'Congés fin d\'année — clinique fermée du 24 au 26.',
    status: 'pending',
  },
];

export const DEMO_VET_CONTACT_REQUESTS = [
  {
    id: 'cr-vet-1',
    _id: 'cr-vet-1',
    subject: 'Dermatite chat — consultation urgente',
    owner: { id: 'demo-client-2', name: 'Ines Trabelsi' },
    petName: 'Mimi',
    animalType: 'cat',
    message: 'Bonjour, Mimi se gratte beaucoup depuis 5 jours avec des rougeurs. Pouvez-vous me proposer un créneau cette semaine ?',
    preferredDate: daysFromNow(2),
    status: 'pending',
    createdAt: daysAgo(1),
  },
  {
    id: 'cr-vet-2',
    _id: 'cr-vet-2',
    subject: 'Vaccin rage chien — rappel',
    owner: { id: 'demo-client-1', name: 'Sami Ben Ali' },
    petName: 'Max',
    animalType: 'dog',
    message: 'Je souhaite planifier le rappel vaccin rage pour Max avant fin du mois.',
    preferredDate: daysFromNow(10),
    status: 'pending',
    createdAt: daysAgo(3),
  },
  {
    id: 'cr-vet-3',
    _id: 'cr-vet-3',
    subject: 'Visite à domicile — boiterie',
    owner: { id: 'demo-client-3', name: 'Youssef Gharbi' },
    petName: 'Rex',
    animalType: 'dog',
    message: 'Rex boite depuis hier sur la patte avant droite. Visite à domicile possible ?',
    preferredDate: daysFromNow(1),
    status: 'confirmed',
    response: 'Bonjour, visite à domicile confirmée demain 9h. Merci de laisser Rex au calme.',
    createdAt: daysAgo(5),
  },
  {
    id: 'cr-vet-4',
    _id: 'cr-vet-4',
    subject: 'Première consultation chat',
    owner: { id: 'demo-client-4', name: 'Nadia Khalfallah' },
    petName: 'Simba',
    animalType: 'cat',
    message: 'Simba vomit depuis 2 jours. Première visite dans votre clinique.',
    preferredDate: daysFromNow(3),
    status: 'pending',
    createdAt: hoursFromNow(-6),
  },
];

export const DEMO_VET_HISTORY = {
  consultations: [
    {
      id: 'hist-c1',
      ownerId: 'demo-client-2',
      petName: 'Mimi',
      diagnosis: 'Dermatite allergique',
      symptoms: 'Grattage excessif, lésions ventrales',
      clinicalExam: 'Erythème zone ventrale, pas de fièvre',
      analysis: 'Suspicion allergie alimentaire ou environnementale',
      recommendations: 'Shampoing dermatologique + régime hypoallergénique',
      status: 'signed',
      updatedAt: daysAgo(12),
      vet: { name: 'Khelifi' },
    },
    {
      id: 'hist-c2',
      ownerId: 'demo-client-3',
      petName: 'Rex',
      diagnosis: 'Arthrose débutante',
      symptoms: 'Raideur au lever, boiterie légère',
      clinicalExam: 'Douleur articulation hanche droite',
      recommendations: 'Anti-inflammatoire 10 j + contrôle poids',
      status: 'signed',
      updatedAt: daysAgo(90),
      vet: { name: 'Khelifi' },
    },
    {
      id: 'hist-c3',
      ownerId: 'demo-client-1',
      petName: 'Max',
      diagnosis: 'Contrôle annuel',
      symptoms: 'Aucun',
      clinicalExam: 'Bon état général, dentition OK',
      recommendations: 'Vaccin rage + antiparasitaire',
      status: 'signed',
      updatedAt: daysAgo(45),
      vet: { name: 'Khelifi' },
      appointmentId: 'vet-appt-1',
    },
    {
      id: 'hist-c4',
      ownerId: 'demo-client-1',
      petName: 'Luna',
      diagnosis: 'Stérilisation — suivi post-op',
      symptoms: 'Cicatrice propre',
      status: 'signed',
      updatedAt: daysAgo(120),
      vet: { name: 'Sassi' },
    },
  ],
  appointments: DEMO_VET_APPOINTMENTS.map((a) => ({
    id: a.id,
    petName: a.petName,
    date: a.date,
    status: a.status,
    title: a.reason,
  })),
  prescriptions: [
    { id: 'rx-1', petName: 'Mimi', diagnosis: 'Dermatite', status: 'active', createdAt: daysAgo(12), title: 'Shampoing + antihistaminique' },
    { id: 'rx-2', petName: 'Rex', diagnosis: 'Arthrose', status: 'completed', createdAt: daysAgo(90), title: 'Anti-inflammatoire chien' },
    { id: 'rx-3', petName: 'Max', diagnosis: 'Prévention', status: 'completed', createdAt: daysAgo(45), title: 'Antiparasitaire spot-on' },
  ],
  records: [],
  dossierEntries: [
    { id: 'de-1', petName: 'Mimi', visitDate: daysAgo(12), title: 'Consultation dermatologie', dossier: { petName: 'Mimi' } },
    { id: 'de-2', petName: 'Max', visitDate: daysAgo(45), title: 'Contrôle annuel + vaccin', dossier: { petName: 'Max' } },
    { id: 'de-3', petName: 'Rex', visitDate: daysAgo(90), title: 'Arthrose — prescription', dossier: { petName: 'Rex' } },
  ],
};

export const DEMO_VET_TIMELINE = [
  { id: 'tl-h1', type: 'consultation', date: daysAgo(12), label: 'Dermatite — shampoing prescrit', signed: true, detail: 'Mimi — allergie poulet suspectée' },
  { id: 'tl-h2', type: 'prescription', date: daysAgo(12), label: 'Ordonnance dermatologique', signed: true },
  { id: 'tl-h3', type: 'vaccine', date: daysAgo(90), label: 'Rappel Typhus / Coryza', signed: true },
  { id: 'tl-h4', type: 'appointment', date: daysAgo(45), label: 'Contrôle annuel Max', signed: false },
  { id: 'tl-h5', type: 'dossier', date: daysAgo(90), label: 'Entrée dossier Rex — arthrose', signed: true },
];

export const DEMO_VET_NUTRITION = {
  summary: 'Apport calorique adapté au poids actuel et à l\'activité modérée. Privilégier une alimentation hypoallergénique si signes cutanés persistants.',
  calories: { supported: true, dailyKcal: 320, dryFoodGramsPerDay: 95 },
  nutritionPlans: [],
  productRecommendations: {
    food: [{ name: 'Croquettes hypoallergéniques Saumon 2 kg' }, { name: 'Pâtée digestive chat 400 g' }],
  },
};

const filterByPatient = (items, ownerId, petName, ownerField = 'ownerId') => {
  if (!items?.length) return items;
  return items.filter((item) => {
    const ownerOk = !ownerId || item[ownerField] === ownerId || item.owner?.id === ownerId;
    const petOk = !petName || item.petName === petName;
    return ownerOk && petOk;
  });
};

export const mergeVetHistory = (apiData) => {
  if (!apiData) return { ...DEMO_VET_HISTORY };
  return {
    ...DEMO_VET_HISTORY,
    ...apiData,
    consultations: apiData.consultations?.length ? apiData.consultations : DEMO_VET_HISTORY.consultations,
    appointments: apiData.appointments?.length ? apiData.appointments : DEMO_VET_HISTORY.appointments,
    prescriptions: apiData.prescriptions?.length ? apiData.prescriptions : DEMO_VET_HISTORY.prescriptions,
    dossierEntries: apiData.dossierEntries?.length ? apiData.dossierEntries : DEMO_VET_HISTORY.dossierEntries,
    records: apiData.records?.length ? apiData.records : DEMO_VET_HISTORY.records,
  };
};

export const filterVetHistory = (data, ownerId, petName) => ({
  ...data,
  consultations: filterByPatient(data.consultations, ownerId, petName),
  appointments: filterByPatient(data.appointments, ownerId, petName),
  prescriptions: filterByPatient(data.prescriptions, ownerId, petName),
  dossierEntries: filterByPatient(data.dossierEntries, ownerId, petName),
});

export const filterVetTimeline = (timeline, ownerId, petName) => {
  const base = timeline?.length ? timeline : DEMO_VET_TIMELINE;
  if (!ownerId && !petName) return base;
  return base;
};

export const getDemoVetClient = (id) =>
  DEMO_VET_CLIENTS.find((c) => c.id === id || c._id === id);

const VET_DEMO_STORAGE_KEY = 'petfood-vet-demo-extra';

export const loadExtraVetClients = () => {
  try {
    return JSON.parse(sessionStorage.getItem(VET_DEMO_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

export const saveExtraVetClient = (client) => {
  const extra = loadExtraVetClients();
  extra.unshift(client);
  sessionStorage.setItem(VET_DEMO_STORAGE_KEY, JSON.stringify(extra.slice(0, 20)));
};

export const mergeVetClients = (apiClients) => {
  const api = withDemoFallback(apiClients, []);
  const extra = loadExtraVetClients();
  const merged = [...extra, ...withDemoFallback(api, DEMO_VET_CLIENTS)];
  const seen = new Set();
  return merged.filter((c) => {
    const id = c.id || c._id;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
};

export const isDemoVetId = (id) => String(id || '').startsWith('demo-') || String(id || '').startsWith('cr-vet-') || String(id || '').startsWith('leave-vet-');
