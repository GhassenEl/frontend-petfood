/** Routes sécurité & profil par rôle PetfoodTN. */
export const ROLE_PROFILE_ROUTES = {
  admin: '/admin/profile',
  client: '/client-profile',
  vet: '/vet/profile',
  livreur: '/livreur/profile',
  vendor: '/vendor/profile',
  moderator: '/moderator/profile',
};

export const ROLE_SECURITY_HUB_ROUTES = {
  admin: '/admin/security',
  client: '/client-security',
  vet: '/vet/security',
  livreur: '/livreur/security',
  vendor: '/vendor/security',
  moderator: '/moderator/security',
};

export const getPasswordChangeRoute = (role) => {
  if (role === 'client') return '/change-password';
  const profile = ROLE_PROFILE_ROUTES[role];
  return profile ? `${profile}?tab=password` : '/login';
};

export const SECURITY_QUICK_LINKS = {
  admin: [
    { to: '/admin/security', label: 'Centre de sécurité', icon: '🛡️' },
    { to: '/admin/database-security', label: 'Sécurité base de données', icon: '🗄️' },
    { to: '/admin/intelligent-security', label: 'Sécurité intelligente', icon: '🧠' },
    { to: '/admin/backups', label: 'Sauvegardes', icon: '💾' },
    { to: '/admin/activity-logs', label: 'Journaux d\'activité', icon: '📋' },
  ],
  moderator: [
    { to: '/moderator/fraud', label: 'Centre anti-fraude', icon: '🚨' },
    { to: '/moderator/reports', label: 'Signalements', icon: '⚖️' },
  ],
  client: [
    { to: '/privacy-policy', label: 'Politique de confidentialité', icon: '🔒' },
    { to: '/cookies-policy', label: 'Politique cookies', icon: '🍪' },
    { to: '/client-iot', label: 'Sécurité IoT', icon: '📡' },
  ],
  vet: [
    { to: '/privacy-policy', label: 'Confidentialité', icon: '🔒' },
  ],
  livreur: [
    { to: '/privacy-policy', label: 'Confidentialité', icon: '🔒' },
  ],
  vendor: [
    { to: '/privacy-policy', label: 'Confidentialité', icon: '🔒' },
  ],
};
