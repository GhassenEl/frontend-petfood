import { getPetPhoto as getPetPhotoFromPlatform, PLATFORM_IMAGES } from './platformImages';

export const PET_PHOTOS = PLATFORM_IMAGES.pets;

export const PET_EMOJI = {
  dog: '🐕', cat: '🐈', bird: '🐦', fish: '🐟', rabbit: '🐰',
  hamster: '🐹', reptile: '🦎', other: '🐾', guinea: '🐹', ferret: '🦡',
};

export const PET_LABEL = {
  dog: 'Chien', cat: 'Chat', bird: 'Oiseau', fish: 'Poisson', rabbit: 'Lapin',
  hamster: 'Hamster', reptile: 'Reptile', other: 'Autre', guinea: 'Cochon d\'Inde', ferret: 'Furet',
};

export const getPetPhoto = getPetPhotoFromPlatform;

export const getPetEmoji = (type, breed) => {
  const b = String(breed || '').toLowerCase();
  if (b.includes('cochon') || b.includes('cobaye')) return PET_EMOJI.guinea;
  if (b.includes('furet') || b.includes('ferret')) return PET_EMOJI.ferret;
  return PET_EMOJI[type] || PET_EMOJI.other;
};
