/** Colliers connectés PetfoodTN — vitaux, états et seuils par espèce. */

export const WEARABLE_ANIMAL_STATES = {
  sleeping: { label: 'Sommeil', icon: '😴', color: '#6366f1', desc: 'Repos profond détecté' },
  resting: { label: 'Au repos', icon: '🧘', color: '#0ea5e9', desc: 'Animal calme, peu d\'activité' },
  calm: { label: 'Calme', icon: '😊', color: '#059669', desc: 'Signes vitaux dans la norme' },
  active: { label: 'Actif', icon: '🏃', color: '#d97706', desc: 'Activité physique en cours' },
  alert: { label: 'Alerte', icon: '⚡', color: '#f59e0b', desc: 'Éveil soudain ou agitation' },
  stressed: { label: 'Stress', icon: '😰', color: '#dc2626', desc: 'Indices de stress physiologique' },
  critical: { label: 'Critique', icon: '🚨', color: '#b91c1c', desc: 'Consultation vétérinaire recommandée' },
};

export const VITAL_THRESHOLDS = {
  dog: {
    spo2: { min: 94, optimal: 97, max: 100 },
    heartRate: { restingMin: 60, restingMax: 120, activeMax: 160, criticalHigh: 180, criticalLow: 45 },
    respiratory: { min: 10, max: 35 },
    bodyTemp: { min: 37.5, max: 39.2 },
    stressIndex: { warn: 55, critical: 75 },
  },
  cat: {
    spo2: { min: 94, optimal: 97, max: 100 },
    heartRate: { restingMin: 120, restingMax: 160, activeMax: 220, criticalHigh: 240, criticalLow: 80 },
    respiratory: { min: 15, max: 40 },
    bodyTemp: { min: 37.8, max: 39.5 },
    stressIndex: { warn: 50, critical: 70 },
  },
};

export const WEARABLE_FEATURES = [
  { id: 'spo2', label: 'SpO₂', icon: '🫁', unit: '%', desc: 'Saturation en oxygène' },
  { id: 'heartRate', label: 'Fréquence cardiaque', icon: '❤️', unit: 'bpm', desc: 'Battements par minute' },
  { id: 'respiratory', label: 'Respiration', icon: '💨', unit: '/min', desc: 'Fréquence respiratoire' },
  { id: 'bodyTemp', label: 'Température', icon: '🌡️', unit: '°C', desc: 'Température corporelle' },
  { id: 'activity', label: 'Activité', icon: '📊', unit: '', desc: 'Niveau d\'activité journalier' },
  { id: 'stress', label: 'Indice stress', icon: '😰', unit: '/100', desc: 'Estimation du stress physiologique' },
];

export const WEARABLE_FIRMWARE = 'PetCollar Vital v2.1';

export default {
  WEARABLE_ANIMAL_STATES,
  VITAL_THRESHOLDS,
  WEARABLE_FEATURES,
  WEARABLE_FIRMWARE,
};
