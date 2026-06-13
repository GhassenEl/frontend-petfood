export const PET_PHOTOS = {
  dog: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=240&h=240&fit=crop',
  cat: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=240&h=240&fit=crop',
  bird: 'https://images.unsplash.com/photo-1552728086-57bdde30cdd3?w=240&h=240&fit=crop',
  fish: 'https://images.unsplash.com/photo-1524704654690-b56c05c969aa?w=240&h=240&fit=crop',
  rabbit: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=240&h=240&fit=crop',
  hamster: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=240&h=240&fit=crop',
  reptile: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=240&h=240&fit=crop',
  other: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=240&h=240&fit=crop',
  guinea: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=240&h=240&fit=crop',
  ferret: 'https://images.unsplash.com/photo-1606567593668-5f718f3aadaa?w=240&h=240&fit=crop',
};

export const PET_EMOJI = {
  dog: '🐕', cat: '🐈', bird: '🐦', fish: '🐟', rabbit: '🐰',
  hamster: '🐹', reptile: '🦎', other: '🐾', guinea: '🐹', ferret: '🦡',
};
export const PET_LABEL = {
  dog: 'Chien', cat: 'Chat', bird: 'Oiseau', fish: 'Poisson', rabbit: 'Lapin',
  hamster: 'Hamster', reptile: 'Reptile', other: 'Autre', guinea: 'Cochon d\'Inde', ferret: 'Furet',
};

export const getPetPhoto = (type, breed) => {
  const b = String(breed || '').toLowerCase();
  if (b.includes('cochon') || b.includes('cobaye')) return PET_PHOTOS.guinea;
  if (b.includes('furet') || b.includes('ferret')) return PET_PHOTOS.ferret;
  return PET_PHOTOS[type] || PET_PHOTOS.other;
};

export const getPetEmoji = (type, breed) => {
  const b = String(breed || '').toLowerCase();
  if (b.includes('cochon') || b.includes('cobaye')) return PET_EMOJI.guinea;
  if (b.includes('furet') || b.includes('ferret')) return PET_EMOJI.ferret;
  return PET_EMOJI[type] || PET_EMOJI.other;
};
