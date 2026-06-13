export const OWNER_EMOTIONS = [
  { id: 'happy', label: 'Très heureux', emoji: '😊' },
  { id: 'satisfied', label: 'Satisfait', emoji: '🙂' },
  { id: 'neutral', label: 'Neutre', emoji: '😐' },
  { id: 'disappointed', label: 'Déçu', emoji: '😞' },
  { id: 'frustrated', label: 'Frustré', emoji: '😠' },
];

export const EMOTION_STYLE = {
  happy: { bg: '#dcfce7', color: '#166534' },
  satisfied: { bg: '#dbeafe', color: '#1e40af' },
  neutral: { bg: '#f3f4f6', color: '#4b5563' },
  disappointed: { bg: '#fef3c7', color: '#92400e' },
  frustrated: { bg: '#fee2e2', color: '#991b1b' },
};

export const PLATFORM_SERVICE_TABS = [
  { id: 'grooming', label: '✂️ Toilettage' },
  { id: 'boarding', label: '🏠 Pension' },
  { id: 'training', label: '🎓 Dressage' },
  { id: 'veterinary', label: '🩺 Vétérinaire' },
];

export const emotionMeta = (id) => OWNER_EMOTIONS.find((e) => e.id === id) || OWNER_EMOTIONS[2];
