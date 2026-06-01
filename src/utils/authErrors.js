const AUTH_ERROR_MAP = {
  'Invalid credentials': 'Identifiants incorrects. Vérifiez votre email et mot de passe.',
  'Account disabled': 'Compte désactivé. Contactez l\'administration.',
  'Email and password are required': 'Email et mot de passe requis.',
  'Email, password and name are required': 'Email, mot de passe et nom requis.',
  'Register disabled in demo mode - use demo accounts':
    'Inscription désactivée en mode démo. Utilisez un compte de démonstration.',
  'User not found': 'Utilisateur introuvable.',
  'Création de compte admin interdite via inscription publique':
    'Création de compte administrateur interdite.',
};

export const mapAuthError = (error, fallback = 'Une erreur est survenue. Réessayez.') => {
  if (!error) return fallback;
  const raw = typeof error === 'string' ? error : error?.error || error?.message;
  if (!raw) return fallback;
  return AUTH_ERROR_MAP[raw] || raw;
};
