/**
 * PetBot — identité unique de l’avatar conseiller PetfoodTN.
 */

export const PETBOT = {
  id: 'petbot',
  displayName: 'PetBot',
  title: 'Conseiller virtuel PetfoodTN',
  /** Portrait unique (personne réelle) */
  photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&h=400&q=80',
  voiceLangDefault: 'fr-FR',
};

export const PETBOT_LANGS = {
  fr: { code: 'fr', speech: 'fr-FR', label: 'Français', flag: '🇫🇷' },
  ar: { code: 'ar', speech: 'ar-TN', label: 'العربية', flag: '🇹🇳' },
  en: { code: 'en', speech: 'en-US', label: 'English', flag: '🇬🇧' },
};

export const PET_SPECIES = {
  cat: { fr: 'chat', en: 'cat', ar: 'قط', keywords: ['chat', 'chatte', 'kitten', 'cat', 'قط', 'قطة'] },
  dog: { fr: 'chien', en: 'dog', ar: 'كلب', keywords: ['chien', 'chienne', 'dog', 'puppy', 'كلب'] },
  bird: { fr: 'oiseau', en: 'bird', ar: 'طائر', keywords: ['oiseau', 'bird', 'perruche', 'canari', 'طائر'] },
  fish: { fr: 'poisson', en: 'fish', ar: 'سمك', keywords: ['poisson', 'fish', 'aquarium', 'سمك'] },
  nac: { fr: 'NAC', en: 'exotic', ar: 'حيوانات صغيرة', keywords: ['nac', 'lapin', 'hamster', 'furet'] },
};

/** Gestes / expressions CSS de l’avatar */
export const AVATAR_MOODS = {
  idle: 'idle',
  smile: 'smile',
  talk: 'talk',
  listen: 'listen',
  think: 'think',
  celebrate: 'celebrate',
  concern: 'concern',
};

export const STORAGE_KEYS = {
  petProfile: 'petbot_pet_profile',
  lang: 'petbot_lang',
  emotionConsent: 'petbot_emotion_consent',
  openedOnce: 'petbot_opened_once',
};
