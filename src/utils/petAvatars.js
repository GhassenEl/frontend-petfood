export const PET_PHOTOS = {
  dog: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=240&h=240&fit=crop',
  cat: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=240&h=240&fit=crop',
  bird: 'https://images.unsplash.com/photo-1552728086-57bdde30cdd3?w=240&h=240&fit=crop',
  fish: 'https://images.unsplash.com/photo-1524704654690-b56c05c969aa?w=240&h=240&fit=crop',
  rabbit: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=240&h=240&fit=crop',
  other: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=240&h=240&fit=crop',
};

export const PET_EMOJI = { dog: '🐕', cat: '🐈', bird: '🐦', fish: '🐟', rabbit: '🐰', other: '🐾' };
export const PET_LABEL = { dog: 'Chien', cat: 'Chat', bird: 'Oiseau', fish: 'Poisson', rabbit: 'Lapin', other: 'Autre' };

export const getPetPhoto = (type) => PET_PHOTOS[type] || PET_PHOTOS.other;
