/**
 * Agent IA hors horaires — persona « vraie personne » (photo + voix).
 * Aide textuelle et vocale quand le support / cabinet est fermé.
 */

export const AFTER_HOURS_AGENT = {
  id: 'sara-khelifi',
  displayName: 'Sara Khelifi',
  title: 'Conseillère PetfoodTN',
  roleLabel: 'Assistante IA avatarisée',
  /** Portrait professionnel (personne réelle — stock Unsplash) */
  photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&h=400&q=80',
  voiceLang: 'fr-FR',
  greetingClosed:
    'Bonjour, je suis Sara, votre conseillère PetfoodTN. Nos équipes sont actuellement hors horaires. Je peux vous aider par message ou vocalement — urgences, commandes, boutique et rendez-vous.',
  greetingOpen:
    'Bonjour, je suis Sara. Un conseiller humain peut aussi vous répondre pendant les horaires d’ouverture. Comment puis-je vous aider ?',
};

/** Horaires support plateforme (hors cabinet véto). */
export const PLATFORM_SUPPORT_HOURS = {
  monday: '09:00-18:00',
  tuesday: '09:00-18:00',
  wednesday: '09:00-18:00',
  thursday: '09:00-18:00',
  friday: '09:00-18:00',
  saturday: '09:00-13:00',
  sunday: '',
};

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const parseHourRange = (range) => {
  const m = String(range || '').match(/(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/);
  if (!m) return null;
  return {
    openMin: Number(m[1]) * 60 + Number(m[2]),
    closeMin: Number(m[3]) * 60 + Number(m[4]),
  };
};

export function getSupportOpenStatus(hours = PLATFORM_SUPPORT_HOURS, now = new Date()) {
  const dayKey = DAY_KEYS[now.getDay()];
  const todayRange = hours[dayKey] || '';
  if (!todayRange.trim()) {
    return { isOpen: false, reason: 'Support fermé aujourd’hui.', todayRange: '' };
  }
  const parsed = parseHourRange(todayRange);
  if (!parsed) return { isOpen: false, reason: 'Horaires indisponibles.', todayRange };
  const nowMin = now.getHours() * 60 + now.getMinutes();
  if (nowMin < parsed.openMin || nowMin >= parsed.closeMin) {
    return {
      isOpen: false,
      reason: `Support fermé (ouvert ${todayRange}).`,
      todayRange,
    };
  }
  return { isOpen: true, reason: `Support ouvert (${todayRange}).`, todayRange };
}

export function buildAfterHoursReply(userText = '') {
  const q = String(userText).toLowerCase();
  if (/urgent|urgence|sang|convulsion|empoison|respire|accident/.test(q)) {
    return {
      content:
        'Je comprends l’urgence. Pendant nos horaires fermés, appelez immédiatement le **+216 71 000 199** (urgences VetCare) ou rendez-vous sur /veterinary. Souhaitez-vous que je vous guide étape par étape ?',
      quickReplies: ['Numéro urgences', 'Conseils premiers soins', 'Prendre RDV demain'],
    };
  }
  if (/commande|livraison|suivi|colis/.test(q)) {
    return {
      content:
        'Pour suivre une commande hors horaires : connectez-vous → **Mes commandes**. Un conseiller traitera les litiges dès la réouverture. Je peux aussi vous indiquer le statut type (en préparation / expédiée).',
      quickReplies: ['Ouvrir mes commandes', 'Contacter le livreur', 'Autre question'],
    };
  }
  if (/produit|catalogue|prix|acheter|boutique|kit|pack/.test(q)) {
    return {
      content:
        'Le catalogue reste disponible 24h/24. Parcourez /client-products — kits d’accueil, packs et santé. Les commandes passées hors horaires seront préparées dès demain matin.',
      quickReplies: ['Voir la boutique', 'Kits & packs', 'Produits santé'],
    };
  }
  if (/rdv|rendez-vous|veterinaire|vétérinaire|bilan/.test(q)) {
    return {
      content:
        'Vous pouvez déjà réserver un **bilan nutritionnel** ou un RDV sur /veterinary?prefill=bilan. Un vétérinaire confirmera à l’ouverture du cabinet.',
      quickReplies: ['Bilan nutritionnel', 'Urgence vétérinaire', 'Horaires cabinet'],
    };
  }
  if (/horaire|ouvert|fermé|ferme|travail/.test(q)) {
    return {
      content:
        'Support PetfoodTN : Lun–Ven 9h–18h, Sam 9h–13h. En dehors, je reste disponible (texte ou vocal) pour vous orienter.',
      quickReplies: ['Parler en vocal', 'Urgence', 'Boutique'],
    };
  }
  return {
    content:
      'Je suis Sara, votre conseillère avatarisée. Posez votre question en texte ou activez le micro. Je peux aider sur boutique, commandes, RDV véto et urgences hors horaires.',
    quickReplies: ['Urgence animale', 'Ma commande', 'Boutique', 'RDV vétérinaire'],
  };
}

export function downloadVCard(profile = {}) {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${profile.personName || profile.name || 'Contact PetfoodTN'}`,
    `ORG:${profile.brandName || 'PetfoodTN'}`,
    `TITLE:${profile.role || profile.title || ''}`,
    profile.phone ? `TEL;TYPE=CELL:${profile.phone}` : '',
    profile.email ? `EMAIL:${profile.email}` : '',
    profile.website ? `URL:${profile.website}` : '',
    profile.address ? `ADR;TYPE=WORK:;;${profile.address};;;;` : '',
    profile.photoUrl ? `PHOTO;VALUE=URI:${profile.photoUrl}` : '',
    'END:VCARD',
  ].filter(Boolean);
  const blob = new Blob([lines.join('\r\n')], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(profile.personName || 'petfoodtn').replace(/\s+/g, '-').toLowerCase()}.vcf`;
  a.click();
  URL.revokeObjectURL(url);
}
