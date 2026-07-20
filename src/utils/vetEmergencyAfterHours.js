/**
 * Agent IA urgences — quand le cabinet est fermé :
 * numéro cabinet, vétérinaires par région, suggestions IA.
 */

import { DEMO_NEARBY_VETS } from './clientDemoData';

/** Cabinet référent PetfoodTN (démo — aligné Clinique VetCare). */
export const DEMO_HOME_CLINIC = {
  name: 'Clinique VetCare Tunis',
  phone: '+216 71 000 101',
  emergencyPhone: '+216 71 000 199',
  region: 'Grand Tunis',
  address: 'Av. Taieb Mhiri, La Marsa',
  /** Plages horaires type Lun–Sam 09:00–18:30 ; Dim fermé */
  openingHours: {
    monday: '09:00-18:30',
    tuesday: '09:00-18:30',
    wednesday: '09:00-18:30',
    thursday: '09:00-18:30',
    friday: '09:00-18:30',
    saturday: '09:00-13:00',
    sunday: '',
  },
};

/** Numéros d’urgence vétérinaire par gouvernorat / région (démo Tunisie). */
export const DEMO_EMERGENCY_VETS_BY_REGION = [
  {
    region: 'Grand Tunis',
    aliases: ['tunis', 'lac', 'la marsa', 'ariana', 'carthage', 'sidi bou said', 'ben arous'],
    clinicPhone: '+216 71 000 199',
    vets: [
      { name: 'Urgences Vet Tunis Lac', phone: '+216 71 000 104', note: '24h / 22h selon jour' },
      { name: 'Dr. Ben Ali — VetCare', phone: '+216 71 000 101', note: 'Astreinte après fermeture' },
      { name: 'Dr. Ines Mansouri', phone: '+216 98 200 301', note: 'Garde week-end Grand Tunis' },
    ],
  },
  {
    region: 'Nabeul / Cap Bon',
    aliases: ['nabeul', 'hammamet', 'kelibia', 'cap bon'],
    clinicPhone: '+216 72 000 410',
    vets: [
      { name: 'Clinique Vet Nabeul Centre', phone: '+216 72 000 401', note: 'Urgences soirée' },
      { name: 'Dr. Ghassen El Jezi — Nabeul', phone: '+216 22 450 780', note: 'Astreinte régionale' },
    ],
  },
  {
    region: 'Sousse / Sahel',
    aliases: ['sousse', 'monastir', 'mahdia', 'sahel'],
    clinicPhone: '+216 73 000 310',
    vets: [
      { name: 'Urgences Vet Sousse', phone: '+216 73 000 301', note: 'Ouvert jusqu\'à 23h' },
      { name: 'Dr. Amira Chaabane', phone: '+216 55 880 220', note: 'Garde Sahel' },
    ],
  },
  {
    region: 'Sfax',
    aliases: ['sfax'],
    clinicPhone: '+216 74 000 210',
    vets: [
      { name: 'Clinique Vet Sfax Urgences', phone: '+216 74 000 201', note: 'Astreinte nuit' },
      { name: 'Dr. Karim Bouaziz', phone: '+216 97 110 440', note: 'Garde week-end' },
    ],
  },
  {
    region: 'Bizerte',
    aliases: ['bizerte'],
    clinicPhone: '+216 72 000 510',
    vets: [
      { name: 'Vet Bizerte Urgences', phone: '+216 72 000 501', note: 'Appel 24h' },
    ],
  },
];

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const normalize = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const parseHourRange = (range) => {
  const m = String(range || '').match(/(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/);
  if (!m) return null;
  return {
    openMin: Number(m[1]) * 60 + Number(m[2]),
    closeMin: Number(m[3]) * 60 + Number(m[4]),
  };
};

/** @returns {{ isOpen: boolean, reason: string, todayRange: string }} */
export function getClinicOpenStatus(clinic = DEMO_HOME_CLINIC, now = new Date()) {
  const hours = clinic.openingHours || {};
  const dayKey = DAY_KEYS[now.getDay()];
  const todayRange = hours[dayKey] || '';
  if (!todayRange.trim()) {
    return {
      isOpen: false,
      reason: 'Cabinet fermé aujourd\'hui (jour de repos).',
      todayRange: '',
    };
  }
  const parsed = parseHourRange(todayRange);
  if (!parsed) {
    return { isOpen: false, reason: 'Horaires indisponibles — considérez le cabinet comme fermé.', todayRange };
  }
  const nowMin = now.getHours() * 60 + now.getMinutes();
  if (nowMin < parsed.openMin || nowMin >= parsed.closeMin) {
    return {
      isOpen: false,
      reason: `Cabinet fermé (ouvert ${todayRange} aujourd'hui).`,
      todayRange,
    };
  }
  return {
    isOpen: true,
    reason: `Cabinet ouvert maintenant (${todayRange}).`,
    todayRange,
  };
}

export function resolveEmergencyRegion(preferredRegion = '', message = '') {
  const hay = normalize(`${preferredRegion} ${message}`);
  for (const block of DEMO_EMERGENCY_VETS_BY_REGION) {
    if (block.aliases.some((a) => hay.includes(normalize(a)))) {
      return block;
    }
  }
  if (hay.includes('grand tunis') || hay.includes('tunisie') || !hay.trim()) {
    return DEMO_EMERGENCY_VETS_BY_REGION[0];
  }
  return DEMO_EMERGENCY_VETS_BY_REGION[0];
}

const SYMPTOM_SUGGESTIONS = [
  {
    keys: ['sang', 'hémorrag', 'hemorrag', 'saigne'],
    tips: [
      'Compressez doucement la plaie avec un linge propre (sans serrer trop fort).',
      'Ne donnez aucun médicament humain (aspirine, paracétamol = toxiques).',
      'Transportez l\'animal calme, allongé, vers les urgences immédiatement.',
    ],
  },
  {
    keys: ['convulsion', 'crise', 'tremble', 'épile'],
    tips: [
      'Éloignez objets dangereux ; ne mettez rien dans la gueule.',
      'Chronométrez la crise ; notez durée et symptômes après.',
      'Appelez les urgences dès la fin de la crise (ou pendant si >2 min).',
    ],
  },
  {
    keys: ['empoison', 'poison', 'toxique', 'rat', 'chocolat', 'raisin'],
    tips: [
      'Ne faites pas vomir sans avis vétérinaire.',
      'Gardez l\'emballage / nom du produit pour le vétérinaire.',
      'Appelez immédiatement le numéro d\'urgence du cabinet.',
    ],
  },
  {
    keys: ['ne respire', 'respiration', 'étouff', 'etouff', 'cyanose'],
    tips: [
      'Libérez les voies (inspectez la gueule si animal calme).',
      'Gardez l\'animal calme, tête légèrement relevée.',
      'Urgence absolue — appelez en route vers la clinique.',
    ],
  },
  {
    keys: ['accident', 'voiture', 'chute', 'fracture', 'boite'],
    tips: [
      'Immobilisez sur un support plan (carton / couverture).',
      'Évitez de manipuler un membre suspecté fracturé.',
      'Appelez avant d\'arriver pour préparer la salle d\'urgence.',
    ],
  },
  {
    keys: ['vomit', 'vomir', 'diarrh', 'fièvre', 'fievre', 'apath'],
    tips: [
      'Notez fréquence, présence de sang, appétit et température si possible.',
      'Eau à volonté ; pas de nourriture jusqu\'à avis véto si vomissements répétés.',
      'Si aggravation (léthargie, douleur) → urgence même hors horaires.',
    ],
  },
];

export function buildAiSuggestions(message = '', pet = null) {
  const hay = normalize(message);
  const matched = SYMPTOM_SUGGESTIONS.find((s) => s.keys.some((k) => hay.includes(normalize(k))));
  const name = pet?.name || 'votre animal';
  if (matched) {
    return [
      `Suggestions IA pour ${name} :`,
      ...matched.tips.map((t, i) => `${i + 1}. ${t}`),
      'Ces conseils n\'ajoutent pas un diagnostic — un vétérinaire doit confirmer.',
    ];
  }
  return [
    `Suggestions IA générales pour ${name} :`,
    '1. Restez calme ; isolez l\'animal dans un endroit sûr et peu stressant.',
    '2. Notez symptômes, heure de début, éventuelle ingestion / trauma.',
    '3. Appelez le cabinet / urgences avant de vous déplacer.',
    '4. N\'administrez aucun médicament humain sans validation vétérinaire.',
  ];
}

/**
 * Construit la réponse agent : cabinet fermé + contacts région + suggestions IA.
 */
export function buildAfterHoursEmergencyReply({
  message = '',
  pet = null,
  region = '',
  clinic = DEMO_HOME_CLINIC,
  nearbyVets = DEMO_NEARBY_VETS,
  forceClosed = false,
} = {}) {
  const status = getClinicOpenStatus(clinic);
  const closed = forceClosed || !status.isOpen;
  const regionBlock = resolveEmergencyRegion(region, message);
  const suggestions = buildAiSuggestions(message, pet);

  const regionalFromNearby = (nearbyVets || [])
    .filter((v) => {
      const r = normalize(v.region || '');
      return (
        regionBlock.aliases.some((a) => r.includes(normalize(a))) ||
        (v.specialties || []).includes('urgence')
      );
    })
    .slice(0, 4);

  const contacts = [
    {
      label: 'Cabinet (accueil)',
      name: clinic.name,
      phone: clinic.phone,
    },
    {
      label: 'Urgences cabinet 24h',
      name: clinic.name,
      phone: clinic.emergencyPhone || clinic.phone,
    },
    ...regionBlock.vets.map((v) => ({
      label: `Véto · ${regionBlock.region}`,
      name: v.name,
      phone: v.phone,
      note: v.note,
    })),
    ...regionalFromNearby.map((v) => ({
      label: `Proche · ${v.region}`,
      name: v.name,
      phone: v.phone,
      note: v.openUntil ? `Ouvert jusqu'à ${v.openUntil}` : undefined,
    })),
  ];

  // dédup phones
  const seen = new Set();
  const uniqueContacts = contacts.filter((c) => {
    const key = String(c.phone || '').replace(/\s/g, '');
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const lines = [];
  if (closed) {
    lines.push(`⚠️ ${status.reason}`);
    lines.push(`Le cabinet « ${clinic.name} » ne reçoit pas en consultation normale pour le moment.`);
  } else {
    lines.push(`ℹ️ ${status.reason}`);
    lines.push('Si le cas est critique, privilégiez quand même la ligne d\'urgence.');
  }

  lines.push('');
  lines.push(`📞 Numéro du cabinet : ${clinic.phone}`);
  if (clinic.emergencyPhone) {
    lines.push(`🚨 Urgences cabinet : ${clinic.emergencyPhone}`);
  }
  lines.push('');
  lines.push(`📍 Vétérinaires d'astreinte — région ${regionBlock.region} :`);
  regionBlock.vets.forEach((v) => {
    lines.push(`• ${v.name} — ${v.phone}${v.note ? ` (${v.note})` : ''}`);
  });

  lines.push('');
  lines.push(...suggestions);

  return {
    message: lines.join('\n'),
    urgent: true,
    clinicClosed: closed,
    clinicStatus: status,
    clinic,
    region: regionBlock.region,
    contacts: uniqueContacts,
    suggestions,
    source: 'after-hours-emergency-agent',
    shouldShowVetCTA: true,
    quickReplies: [
      'Appeler urgences cabinet',
      'Vétérinaires près de chez moi',
      'Téléconsultation urgente',
    ],
  };
}

export function isUrgentOrAfterHoursQuery(message = '') {
  const hay = normalize(message);
  const urgentKeys = [
    'urgence',
    'urgent',
    'sang',
    'convulsion',
    'empoison',
    'accident',
    'fracture',
    'ne respire',
    'inconscient',
    'cabinet ferme',
    'cabinet fermé',
    'ferme',
    'fermé',
    'apres heure',
    'après heure',
    'hors horaire',
    'garde',
    'astreinte',
    'nuit',
    'dimanche',
  ];
  return urgentKeys.some((k) => hay.includes(normalize(k)));
}

export default buildAfterHoursEmergencyReply;
