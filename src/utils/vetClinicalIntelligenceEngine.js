/**
 * Moteur IA clinique vétérinaire — diagnostic, dossier, ordonnances, suivi, nutrition.
 */
import { SYMPTOM_DISEASE_HINTS, buildMedicationRecommendations } from './vetMedicationRecommender';

const normalize = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

/** Analyse symptômes → pistes diagnostiques + examens complémentaires. */
export const analyzeSymptomsForDiagnosis = ({ symptoms = '', pet = {}, ownerNotes = '' } = {}) => {
  const text = normalize(`${symptoms} ${ownerNotes}`);
  const matched = SYMPTOM_DISEASE_HINTS.filter((h) =>
    h.keywords.some((k) => text.includes(normalize(k))),
  );

  const diseases = [...new Set(matched.flatMap((m) => m.diseases))];
  const hypotheses = diseases.length
    ? diseases.map((d, i) => ({
      condition: d,
      confidence: i === 0 ? 'Probable' : 'Possible',
      rationale: `Correspondance symptômes : ${matched.find((m) => m.diseases.includes(d))?.keywords.slice(0, 2).join(', ')}`,
    }))
    : [{ condition: 'Examen clinique approfondi requis', confidence: 'À confirmer', rationale: 'Symptômes non spécifiques ou insuffisants.' }];

  const exams = [];
  if (text.match(/grattage|prurit|rougeur|pelage/)) {
    exams.push({ test: 'Frottis cutané / scrape', reason: 'Rechercher parasites ou infection secondaire' });
    exams.push({ test: 'Test allergie alimentaire', reason: 'Exclure dermatite alimentaire' });
  }
  if (text.match(/boite|articulation|raideur/)) {
    exams.push({ test: 'Radiographie articulaire', reason: 'Évaluer arthrose ou lésion osseuse' });
  }
  if (text.match(/vomissement|diarr/)) {
    exams.push({ test: 'Coproscopie + hémogramme', reason: 'Rechercher parasitose ou infection digestive' });
  }
  if (!exams.length) {
    exams.push({ test: 'Examen clinique complet', reason: 'Bilan initial avant examens ciblés' });
  }

  const urgency = text.match(/fièvre|fievre|urgent|sang|convulsion/)
    ? 'urgent'
    : text.match(/vomissement|boite|anorexie/) ? 'soon' : 'routine';

  return {
    petName: pet.name || 'Patient',
    symptomsParsed: symptoms.split(/[,;.\n]/).map((s) => s.trim()).filter(Boolean),
    diagnosticHypotheses: hypotheses.slice(0, 4),
    screeningRecommendations: exams.slice(0, 4),
    urgency,
    urgencyLabel: urgency === 'urgent' ? 'Consultation urgente' : urgency === 'soon' ? 'Sous 48–72 h' : 'Suivi de routine',
    aiSummary: hypotheses.length
      ? `Pistes principales : ${hypotheses.slice(0, 2).map((h) => h.condition).join(', ')}. Examens suggérés : ${exams.slice(0, 2).map((e) => e.test).join(', ')}.`
      : 'Compléter la saisie des symptômes pour affiner les pistes diagnostiques.',
    disclaimer: 'Aide à la décision — diagnostic définitif sous responsabilité du vétérinaire.',
  };
};

/** Analyse intelligente dossier médical. */
export const analyzeMedicalDossier = (dossier = {}, timeline = [], consultations = []) => {
  const alerts = [];
  const riskFactors = [];

  if (dossier.allergies) {
    alerts.push({ type: 'allergy', severity: 'high', label: 'Allergie connue', detail: dossier.allergies });
  }

  const activeRx = consultations.filter((c) =>
    String(c.recommendations || c.diagnosis || '').match(/prescription|traitement|anti/i),
  );
  if (activeRx.length) {
    alerts.push({
      type: 'treatment',
      severity: 'medium',
      label: 'Traitement en cours',
      detail: activeRx[0]?.recommendations || activeRx[0]?.diagnosis,
    });
  }

  const chronic = consultations.filter((c) =>
    String(c.diagnosis || '').match(/arthrose|diabète|diabete|obésité|obesite|allerg/i),
  );
  chronic.forEach((c) => {
    riskFactors.push({ factor: c.diagnosis, petName: c.petName, since: c.updatedAt });
  });

  if (dossier.chronicConditions) {
    riskFactors.push({ factor: dossier.chronicConditions, source: 'dossier' });
  }

  const recentVisits = timeline.filter((t) => {
    const d = new Date(t.date);
    return Date.now() - d.getTime() < 90 * 86400000;
  });

  const summary = [
    dossier.allergies ? `⚠️ Allergies : ${dossier.allergies}` : null,
    riskFactors.length ? `Facteurs de risque : ${riskFactors.map((r) => r.factor).join(', ')}` : null,
    recentVisits.length ? `${recentVisits.length} événement(s) récent(s) dans le dossier` : 'Aucun événement récent',
  ].filter(Boolean).join(' · ');

  return {
    dossierNumber: dossier.dossierNumber || '—',
    petName: dossier.petName || consultations[0]?.petName || 'Patient',
    alerts,
    riskFactors,
    timelineHighlights: timeline.slice(0, 6),
    importantHistory: [
      ...(dossier.allergies ? [{ label: 'Allergies', value: dossier.allergies, priority: 'high' }] : []),
      ...(dossier.vaccinations ? [{ label: 'Vaccinations', value: dossier.vaccinations, priority: 'medium' }] : []),
      ...(dossier.notes ? [{ label: 'Notes', value: dossier.notes, priority: 'low' }] : []),
    ],
    aiSummary: summary || 'Dossier sans alerte particulière — vérifier antécédents avec le propriétaire.',
  };
};

/** Génération ordonnance assistée. */
export const generatePrescriptionSuggestions = (input = {}) => {
  const recs = buildMedicationRecommendations({
    diagnosis: input.diagnosis || '',
    symptoms: input.symptoms || '',
    animalType: input.pet?.type || input.animalType || 'dog',
    weightKg: input.pet?.weightKg || input.weightKg || 5,
  });

  const supplements = [];
  const diagnosis = normalize(input.diagnosis || input.symptoms || '');
  if (diagnosis.match(/arthrose|arthrite/)) {
    supplements.push({ name: 'Oméga-3 articulaires', dosage: '1 capsule/j', rationale: 'Soutien articulaire' });
  }
  if (diagnosis.match(/dermat|allerg|prurit/)) {
    supplements.push({ name: 'Complément peau & pelage', dosage: 'Selon poids', rationale: 'Barrière cutanée' });
  }

  return {
    medications: recs.slice(0, 5),
    supplements,
    dietNote: recs[0]?.dietNote || null,
    aiSummary: recs.length
      ? `${recs.length} traitement(s) proposé(s) selon diagnostic, espèce et stock pharmacie.`
      : 'Précisez diagnostic ou symptômes pour générer des propositions.',
    disclaimer: 'Vérifier contre-indications, poids exact et interactions avant prescription.',
  };
};

/** Suivi médical prédictif — animaux à surveiller + rappels. */
export const predictFollowUpNeeds = (patients = []) => {
  const reminders = [];
  const priorityPatients = [];

  patients.forEach((p) => {
    const reasons = [];
    let priority = 'low';

    if (p.chronicCondition) {
      reasons.push(`Pathologie chronique : ${p.chronicCondition}`);
      priority = 'medium';
    }
    if (p.daysSinceLastVisit != null && p.daysSinceLastVisit > 90) {
      reasons.push(`Dernière visite il y a ${p.daysSinceLastVisit} j`);
      priority = priority === 'medium' ? 'high' : 'medium';
    }
    if (p.overdueVaccine) {
      reasons.push('Vaccin en retard');
      priority = 'high';
    }
    if (p.weightTrend === 'up' && p.riskObesity) {
      reasons.push('Prise de poids — risque obésité');
      priority = 'medium';
    }
    if (p.symptomsPending) {
      reasons.push(`Symptômes signalés : ${p.symptomsPending}`);
      priority = 'high';
    }

    if (reasons.length) {
      priorityPatients.push({ ...p, reasons, priority });
      reminders.push({
        id: `rem-${p.id || p.petName}`,
        petName: p.petName,
        ownerName: p.ownerName,
        dueInDays: p.nextVisitDays ?? (priority === 'high' ? 3 : 14),
        reason: reasons.join(' · '),
        priority,
        suggestedAction: priority === 'high' ? 'Planifier consultation' : 'Rappel contrôle',
      });
    }
  });

  return {
    priorityPatients: priorityPatients.sort((a, b) => {
      const p = { high: 3, medium: 2, low: 1 };
      return (p[b.priority] || 0) - (p[a.priority] || 0);
    }),
    reminders: reminders.sort((a, b) => a.dueInDays - b.dueInDays),
    stats: {
      highPriority: priorityPatients.filter((p) => p.priority === 'high').length,
      totalReminders: reminders.length,
    },
  };
};

/** Séries évolution santé (poids, alimentation, paramètres). */
export const buildHealthEvolutionSeries = (petName = 'Patient') => ({
  petName,
  weightKg: [
    { month: 'Jan', value: 4.2 },
    { month: 'Fév', value: 4.3 },
    { month: 'Mar', value: 4.5 },
    { month: 'Avr', value: 4.4 },
    { month: 'Mai', value: 4.6 },
    { month: 'Juin', value: 4.55 },
  ],
  dailyKcal: [
    { month: 'Jan', value: 280 },
    { month: 'Fév', value: 290 },
    { month: 'Mar', value: 310 },
    { month: 'Avr', value: 300 },
    { month: 'Mai', value: 320 },
    { month: 'Juin', value: 315 },
  ],
  healthScore: [
    { month: 'Jan', value: 82 },
    { month: 'Fév', value: 80 },
    { month: 'Mar', value: 76 },
    { month: 'Avr', value: 78 },
    { month: 'Mai', value: 74 },
    { month: 'Juin', value: 77 },
  ],
  insights: [
    { metric: 'Poids', trend: 'stable', message: 'Variation < 5 % sur 6 mois — acceptable.' },
    { metric: 'Apport calorique', trend: 'up', message: 'Légère hausse (+14 %) — surveiller si sédentarité.' },
    { metric: 'Score bien-être', trend: 'down', message: 'Baisse modérée — corréler avec épisode cutané récent.' },
  ],
});

/** Nutrition adaptée aux pathologies. */
export const recommendNutritionForPathology = ({ pathology = '', pet = {}, allergies = '' } = {}) => {
  const p = normalize(pathology);
  const plans = [];

  if (p.match(/obes|surpoids/)) {
    plans.push({
      pathology: 'Obésité',
      diet: 'Régime hypocalorique haute satiété',
      kcalTarget: '80 % besoin maintenance',
      foods: ['Croquettes light vétérinaires', 'Friandises < 10 % ration'],
      avoid: ['Table scraps', 'Friandises riches'],
      monitoring: ['Pesée mensuelle', 'Score condition corporelle'],
    });
  }
  if (p.match(/diab/)) {
    plans.push({
      pathology: 'Diabète',
      diet: 'Régime faible glucides, fibres élevées',
      kcalTarget: 'Stable — fractionner les repas',
      foods: ['Croquettes diabétiques', 'Repas 2–3×/jour fixes'],
      avoid: ['Sucre', 'Friandises glucidiques'],
      monitoring: ['Glycémie', 'Poids', 'Soif / mictions'],
    });
  }
  if (p.match(/allerg|dermat|prurit/)) {
    plans.push({
      pathology: 'Allergie / dermatite',
      diet: 'Hypoallergénique ou élimination',
      kcalTarget: 'Maintenance selon poids',
      foods: ['Protéine novelle (saumon, canard)', 'Croquettes vétérinaires HA'],
      avoid: [allergies || 'Protéines suspectées', 'Nourriture table'],
      monitoring: ['Prurit', 'Lésions cutanées', 'Grattage'],
    });
  }
  if (p.match(/arthrose|arthrite|articul/)) {
    plans.push({
      pathology: 'Arthrose',
      diet: 'Contrôle poids + oméga-3',
      kcalTarget: 'Éviter surpoids — charge articulaire',
      foods: ['Croquettes mobilité', 'Oméga-3 EPA/DHA'],
      avoid: ['Excès calorique'],
      monitoring: ['Mobilité', 'Douleur au lever'],
    });
  }
  if (p.match(/renal|rein/)) {
    plans.push({
      pathology: 'Insuffisance rénale',
      diet: 'Rénal vétérinaire — phosphore et protéines modérés',
      kcalTarget: 'Adapté stade IRIS',
      foods: ['Croquettes rénal stade 2–3'],
      avoid: ['Protéines excessives non contrôlées'],
      monitoring: ['Créatinine', 'Hydratation', 'Appétit'],
    });
  }

  if (!plans.length) {
    plans.push({
      pathology: pathology || 'Maintenance',
      diet: 'Alimentation équilibrée adaptée espèce et âge',
      kcalTarget: pet.weightKg ? `~${Math.round(pet.weightKg * 30)} kcal/j (estimation)` : 'Calculer via profil',
      foods: ['Croquettes premium adaptées', 'Eau fraîche permanente'],
      avoid: ['Excès friandises'],
      monitoring: ['Poids trimestriel', 'Pelage et énergie'],
    });
  }

  return {
    petName: pet.name || 'Patient',
    plans,
    aiSummary: `${plans.length} régime(s) suggéré(s) pour ${pathology || 'maintenance'}.`,
  };
};

/** Brouillon compte rendu médical. */
export const draftMedicalReport = ({ pet = {}, diagnosis = '', exam = '', treatment = '', followUpDays = 14 } = {}) => ({
  title: `Compte rendu — ${pet.name || 'Patient'}`,
  sections: {
    motif: diagnosis || 'Consultation de suivi',
    examen: exam || 'Examen clinique complet — état général satisfaisant.',
    diagnostic: diagnosis || 'À préciser',
    traitement: treatment || 'Traitement symptomatique adapté.',
    suivi: `Contrôle recommandé dans ${followUpDays} jours. Signes d'alerte expliqués au propriétaire.`,
  },
  fullText: [
    `COMPTE RENDU VÉTÉRINAIRE — ${pet.name || 'Patient'} (${pet.type || 'animal'})`,
    '',
    `Motif : ${diagnosis || 'Consultation'}`,
    '',
    `Examen clinique : ${exam || '—'}`,
    '',
    `Diagnostic / hypothèse : ${diagnosis || '—'}`,
    '',
    `Traitement / recommandations : ${treatment || '—'}`,
    '',
    `Suivi : rendez-vous de contrôle sous ${followUpDays} jours.`,
    '',
    '— Document généré par assistant IA — à valider et signer par le vétérinaire.',
  ].join('\n'),
});

/** Enrichit le pack intelligence vétérinaire. */
export const enrichVetIntelligencePack = (base = {}) => {
  const patients = base.patients || [];
  const selectedPet = base.selectedPet || patients[0] || { name: 'Mimi', type: 'cat', weightKg: 4.5 };

  const followUp = predictFollowUpNeeds(patients);
  const dossierAnalysis = analyzeMedicalDossier(
    base.dossier || {},
    base.timeline || [],
    base.consultations || [],
  );

  return {
    ...base,
    followUp,
    dossierAnalysis,
    healthEvolution: buildHealthEvolutionSeries(selectedPet.name),
    diagnosticDemo: analyzeSymptomsForDiagnosis({
      symptoms: 'Grattage excessif, rougeurs zone ventrale',
      pet: selectedPet,
      ownerNotes: base.ownerNotes || 'Depuis 5 jours, pas de fièvre',
    }),
    prescriptionDemo: generatePrescriptionSuggestions({
      diagnosis: 'Dermatite allergique',
      symptoms: 'grattage prurit',
      pet: selectedPet,
    }),
    nutritionDemo: recommendNutritionForPathology({
      pathology: 'Allergie / dermatite',
      pet: selectedPet,
      allergies: base.dossier?.allergies,
    }),
    stats: {
      patientsMonitored: patients.length,
      highPriorityFollowUp: followUp.stats.highPriority,
      dossierAlerts: dossierAnalysis.alerts.length,
    },
  };
};

export default enrichVetIntelligencePack;
