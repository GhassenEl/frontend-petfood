/** Réponses locales questions — assistant vétérinaire avant consultation */
import {
  buildAfterHoursEmergencyReply,
  isUrgentOrAfterHoursQuery,
  DEMO_HOME_CLINIC,
} from './vetEmergencyAfterHours';
import { DEMO_NEARBY_VETS } from './clientDemoData';

const QUESTIONS = [
  {
    keys: ['vomit', 'vomir', 'vomissement', 'vomi'],
    reply: (pet) =>
      `Vomissements chez ${pet?.name || 'votre animal'} : jeûne 12 h (eau à volonté), surveillez fréquence et sang. Si vomissements répétés >24 h, léthargie ou douleur abdominale → consultation urgente. Cause fréquente : changement alimentaire brusque ou indigestion.`,
    urgent: false,
  },
  {
    keys: ['diarrh', 'diarrhée', 'selles molles'],
    reply: (pet) =>
      `Diarrhée : hydratez bien ${pet?.name || 'l\'animal'}. Régime digestif (riz + poulet cuit) 24–48 h si adulte en bonne forme. Consultez si sang, fièvre, apathie ou persistance >48 h.`,
    urgent: false,
  },
  {
    keys: ['puce', 'puces', 'tique', 'tiques', 'parasite'],
    reply: () =>
      'Traitement antiparasitaire externe (pipette ou collier) selon poids et espèce. Traitez aussi la literie et l\'environnement. En cas d\'infestation massive ou réactions cutanées, consultez pour un protocole adapté.',
    urgent: false,
  },
  {
    keys: ['vaccin', 'vaccination', 'rappel'],
    reply: (pet) =>
      `Calendrier vaccinal ${pet?.type === 'cat' ? 'chat' : 'chien'} : primo-vaccination puis rappels annuels (rage obligatoire en Tunisie). Vérifiez le carnet — rappel CHPPi/Typhus chat ou CHPPi chien selon protocole vétérinaire.`,
    urgent: false,
  },
  {
    keys: ['poids', 'maigrir', 'grossir', 'surpoids', 'obèse'],
    reply: (pet) =>
      `${pet?.name || 'Votre animal'} : pesez régulièrement et comparez à la courbe de race. Perte >10 % en 1 mois ou gain rapide → bilan vétérinaire. Ajustez les portions (voir Nutrition IA) et l\'activité quotidienne.`,
    urgent: false,
  },
  {
    keys: ['aliment', 'croquette', 'nourriture', 'change', 'régime'],
    reply: (pet) =>
      `Changement alimentaire pour ${pet?.name || 'votre compagnon'} : transition sur 7–10 jours (75/25 puis 50/50 puis 25/75). Évitez les restes gras. Utilisez le module Nutrition adaptative IA pour un plan personnalisé.`,
    urgent: false,
  },
  {
    keys: ['chat', 'ne mange', 'anorexie', 'appétit', 'mange pas'],
    reply: (pet) =>
      `Perte d'appétit >24 h chez ${pet?.name || 'l\'animal'} (surtout chat) : risque hépatique. Consultez rapidement si associée à vomissements ou apathie. Offrez nourriture appétente tiédie en attendant.`,
    urgent: true,
  },
];

export const VET_QUICK_QUESTIONS = [
  'Urgence : mon animal saigne, cabinet fermé ?',
  'Quels vétérinaires d\'astreinte à Nabeul ?',
  'Mon chien vomit depuis hier, que faire ?',
  'Mon chat ne mange plus depuis ce matin',
  'Quand faire le rappel vaccinal ?',
];

const normalize = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

/**
 * @param {string} message
 * @param {object|null} pet
 * @param {{ region?: string, clinic?: object, nearbyVets?: array, forceClosed?: boolean }} [context]
 */
export const getLocalVetAssistantReply = (message, pet = null, context = {}) => {
  const {
    region = '',
    clinic = DEMO_HOME_CLINIC,
    nearbyVets = DEMO_NEARBY_VETS,
    forceClosed = false,
  } = context;

  if (isUrgentOrAfterHoursQuery(message)) {
    return buildAfterHoursEmergencyReply({
      message,
      pet,
      region,
      clinic,
      nearbyVets,
      forceClosed,
    });
  }

  const hay = normalize(message);
  for (const questionEntry of QUESTIONS) {
    if (questionEntry.keys.some((k) => hay.includes(normalize(k)))) {
      const base = {
        message: questionEntry.reply(pet),
        urgent: questionEntry.urgent,
        source: 'local-questions',
        shouldShowVetCTA: questionEntry.urgent,
        quickReplies: questionEntry.urgent
          ? ['Urgence : cabinet fermé ?', 'Trouver un vétérinaire urgent', 'Prendre RDV téléconsultation']
          : ['Autre question', 'Prendre RDV préventif'],
      };
      if (questionEntry.urgent) {
        const afterHours = buildAfterHoursEmergencyReply({
          message,
          pet,
          region,
          clinic,
          nearbyVets,
          forceClosed,
        });
        return {
          ...afterHours,
          message: `${questionEntry.reply(pet)}\n\n———\n${afterHours.message}`,
          source: 'local-questions+after-hours',
        };
      }
      return base;
    }
  }

  return {
    message:
      `Merci pour votre question concernant ${pet?.name || 'votre animal'}. En l'absence de connexion à l'IA cloud, voici une orientation générale : observez l'évolution 24–48 h, notez symptômes (appétit, selles, énergie) et consultez un vétérinaire si aggravation. Ce conseil ne remplace pas un examen clinique.\n\nSi c'est urgent ou si le cabinet est fermé, écrivez « urgence » ou « cabinet fermé » pour obtenir les numéros d'astreinte par région.`,
    urgent: false,
    source: 'local-fallback',
    shouldShowVetCTA: true,
    quickReplies: ['Urgence : cabinet fermé ?', 'Trouver un vétérinaire', 'Questions fréquentes vaccination'],
  };
};

export default getLocalVetAssistantReply;
