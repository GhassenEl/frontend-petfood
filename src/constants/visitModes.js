export const VISIT_MODES = [
  { value: 'cabinet', label: 'Au cabinet', icon: '🏥', description: 'Consultation en clinique vétérinaire' },
  { value: 'home', label: 'À domicile', icon: '🏠', description: 'Le vétérinaire se déplace chez vous' },
  { value: 'online', label: 'En ligne', icon: '📹', description: 'Téléconsultation Google Meet (caméra + voix)' },
];

export const visitModeLabel = (mode) =>
  VISIT_MODES.find((m) => m.value === mode)?.label || 'Au cabinet';

export const isHomeVisit = (record) =>
  record?.visitMode === 'home' || record?.type === 'veterinary_home_visit';

export const isOnlineVisit = (record) =>
  record?.visitMode === 'online' || record?.type === 'veterinary_teleconsultation';

export const resolveVisitMode = (record) => {
  if (isOnlineVisit(record)) return 'online';
  if (isHomeVisit(record)) return 'home';
  return record?.visitMode || 'cabinet';
};

export const visitModeBadge = (record) => {
  const mode = resolveVisitMode(record);
  if (mode === 'online') return { label: '📹 En ligne', bg: '#ede9fe', color: '#6d28d9' };
  if (mode === 'home') return { label: '🏠 À domicile', bg: '#fef3c7', color: '#b45309' };
  return { label: '🏥 Cabinet', bg: '#dbeafe', color: '#1d4ed8' };
};
