/** Navigation sidebar — espace vétérinaire (config dynamique). */

export const VET_SIDEBAR_SECTIONS = [
  {
    title: '🩺 Activités cliniques',
    items: [
      { id: 'dashboard', label: 'Tableau de bord', icon: '📊' },
      { id: 'calendar', label: 'Calendrier', icon: '📅' },
      { id: 'availability', label: 'Disponibilité', icon: '🟢' },
      { id: 'prescriptions', label: 'Ordonnances', icon: '💊' },
      {
        id: 'medication-recommendations',
        label: 'Recommandation médicaments',
        icon: '🧬',
        route: '/vet/medication-recommendations',
      },
      { id: 'diagnostics', label: 'Détection maladie', icon: '🔬' },
      { id: 'pharmacy', label: 'Pharmacie', icon: '🏪' },
      { id: 'clinic', label: 'Ma clinique', icon: '🏥' },
      { id: 'medical-dossiers', label: 'Dossiers médicaux', icon: '📁' },
      { id: 'vaccinations', label: 'Vaccinations', icon: '💉' },
      { id: 'nutrition', label: 'Conseils nutrition', icon: '🥗' },
    ],
  },
  {
    title: '👥 Patients & suivi',
    items: [
      { id: 'clients', label: 'Clients', icon: '👥' },
      { id: 'history', label: 'Historique', icon: '📜' },
      { id: 'teleconsult', label: 'Téléconsultations', icon: '📹' },
      { id: 'contact-requests', label: 'Demandes contact', icon: '📩' },
    ],
  },
  {
    title: '🤖 Intelligence clinique',
    items: [
      { id: 'recommendations', label: 'Recommandations IA', icon: '🎯', route: '/vet/recommendations' },
      { id: 'chat-history', label: 'Historique chatbot', icon: '💬', route: '/vet/chat-history' },
    ],
  },
  {
    title: '👤 Compte',
    items: [
      { id: 'leave-requests', label: 'Congés / maladie', icon: '🏖️' },
      { id: 'profile', label: 'Profil', icon: '👤' },
      { id: 'security', label: 'Sécurité', icon: '🛡️' },
    ],
  },
];

/** Badges dynamiques par item sidebar vétérinaire. */
export const getVetSidebarBadge = (itemId, overview = {}) => {
  if (itemId === 'pharmacy' && overview.pharmacy?.ruptures > 0) {
    return { count: overview.pharmacy.ruptures, tone: 'critical' };
  }
  if (itemId === 'vaccinations' && overview.vaccinesOverdue > 0) {
    return { count: overview.vaccinesOverdue, tone: 'warn' };
  }
  if (itemId === 'calendar' && overview.unassigned > 0) {
    return { count: overview.unassigned, tone: 'critical' };
  }
  if (itemId === 'contact-requests' && overview.contactPending > 0) {
    return { count: overview.contactPending, tone: 'info' };
  }
  return null;
};
