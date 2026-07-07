/** Dossiers médicaux client — fallback démo lorsque l'API vétérinaire est vide. */

const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();

export const DEMO_CLIENT_MEDICAL_DOSSIERS = [
  {
    id: 'doss-max',
    _id: 'doss-max',
    dossierNumber: 'DMP-2026-0038',
    petName: 'Max',
    animalType: 'dog',
    status: 'active',
    allergies: 'Aucune connue',
    lastVisit: daysAgo(45),
    entriesCount: 4,
  },
  {
    id: 'doss-luna',
    _id: 'doss-luna',
    dossierNumber: 'DMP-2026-0055',
    petName: 'Luna',
    animalType: 'cat',
    status: 'active',
    allergies: 'Poulet',
    lastVisit: daysAgo(12),
    entriesCount: 3,
  },
];

export const DEMO_CLIENT_MEDICAL_DETAILS = {
  'doss-max': {
    id: 'doss-max',
    dossierNumber: 'DMP-2026-0038',
    petName: 'Max',
    animalType: 'dog',
    status: 'active',
    allergies: 'Aucune connue',
    weight: 28,
    creator: { name: 'Salma Khelifi', id: 'vet-demo-1' },
    prescriptions: [
      {
        id: 'rx-max-1',
        medication: 'Bravecto 1000 mg',
        dosage: '1 comprimé tous les 3 mois',
        duration: '12 mois',
        issuedAt: daysAgo(45),
        vetName: 'Dr. Salma Khelifi',
      },
      {
        id: 'rx-max-2',
        medication: 'Drontal Plus',
        dosage: '1 comprimé (vermifuge)',
        duration: '1 dose',
        issuedAt: daysAgo(45),
        vetName: 'Dr. Salma Khelifi',
      },
    ],
    entries: [
      {
        id: 'ent-max-1',
        title: 'Consultation annuelle',
        visitDate: daysAgo(45),
        diagnosis: 'Bon état général — vaccins à jour',
        treatment: 'Rappel rage + vermifuge',
        isSigned: true,
        vetSignatureImage: null,
      },
      {
        id: 'ent-max-2',
        title: 'Contrôle dermatologique',
        visitDate: daysAgo(120),
        diagnosis: 'Dermatite légère — grattage saisonnier',
        treatment: 'Shampooing apaisant 2×/semaine pendant 3 semaines',
        isSigned: true,
      },
      {
        id: 'ent-max-3',
        title: 'Suivi post-vaccination',
        visitDate: daysAgo(200),
        diagnosis: 'Réaction locale normale au point d\'injection',
        treatment: 'Surveillance 48 h — aucun traitement supplémentaire',
        isSigned: true,
      },
      {
        id: 'ent-max-4',
        title: 'Bilan sénior',
        visitDate: daysAgo(365),
        diagnosis: 'Articulations légèrement raides — activité modérée recommandée',
        treatment: 'Complément oméga-3 + marche quotidienne 30 min',
        isSigned: true,
      },
    ],
  },
  'doss-luna': {
    id: 'doss-luna',
    dossierNumber: 'DMP-2026-0055',
    petName: 'Luna',
    animalType: 'cat',
    status: 'active',
    allergies: 'Poulet',
    weight: 4.2,
    creator: { name: 'Salma Khelifi', id: 'vet-demo-1' },
    prescriptions: [
      {
        id: 'rx-luna-1',
        medication: 'Cortisone topique (oreilles)',
        dosage: '2 gouttes / oreille, 2×/jour, 7 jours',
        duration: '7 jours',
        issuedAt: daysAgo(12),
        vetName: 'Dr. Salma Khelifi',
      },
    ],
    entries: [
      {
        id: 'ent-luna-1',
        title: 'Otite externe',
        visitDate: daysAgo(12),
        diagnosis: 'Otite légère — nettoyage + traitement local',
        treatment: 'Cortisone topique 7 jours, contrôle dans 10 jours',
        isSigned: true,
      },
      {
        id: 'ent-luna-2',
        title: 'Vaccination typhus / coryza',
        visitDate: daysAgo(90),
        diagnosis: 'Vaccination de rappel effectuée',
        treatment: 'Prochain rappel dans 12 mois',
        isSigned: true,
      },
      {
        id: 'ent-luna-3',
        title: 'Consultation nutrition',
        visitDate: daysAgo(180),
        diagnosis: 'Légère surcharge pondérale',
        treatment: 'Ration pâtée sans poulet + croquettes light',
        isSigned: true,
      },
    ],
  },
};

export const getDemoClientMedicalDossier = (id) =>
  DEMO_CLIENT_MEDICAL_DETAILS[id]
    ? JSON.parse(JSON.stringify(DEMO_CLIENT_MEDICAL_DETAILS[id]))
    : null;
