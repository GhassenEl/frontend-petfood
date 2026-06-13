/** Mappe une note 1–5 vers une émotion propriétaire. */
export const emotionFromRating = (rating) => {
  const r = Math.min(5, Math.max(1, Number(rating) || 3));
  if (r >= 5) return 'happy';
  if (r === 4) return 'satisfied';
  if (r === 3) return 'neutral';
  if (r === 2) return 'disappointed';
  return 'frustrated';
};

export const clampRating = (value) => Math.min(5, Math.max(1, Math.round(Number(value) || 1)));

export const ratingLabel = (rating) => {
  const labels = {
    1: 'Très insatisfait',
    2: 'Insatisfait',
    3: 'Correct',
    4: 'Satisfait',
    5: 'Excellent',
  };
  return labels[clampRating(rating)] || '—';
};
