const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const validateEmail = (email) => {
  const value = (email || '').trim();
  if (!value) return 'L\'adresse email est requise';
  if (value.length > 254) return 'L\'email ne peut pas dépasser 254 caractères';
  if (!EMAIL_REGEX.test(value)) return 'Format invalide (ex. nom@domaine.tn)';
  return '';
};

export const validatePassword = (password) => {
  if (!password) return 'Le mot de passe est requis';
  if (password.length < 6) return 'Minimum 6 caractères';
  if (password.length > 128) return 'Maximum 128 caractères';
  if (/\s/.test(password)) return 'Le mot de passe ne doit pas contenir d\'espaces';
  return '';
};

export const validateLoginForm = ({ email, password }) => {
  const errors = {};
  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);
  if (emailError) errors.email = emailError;
  if (passwordError) errors.password = passwordError;
  return { valid: Object.keys(errors).length === 0, errors };
};

export const validateName = (name) => {
  const value = (name || '').trim();
  if (!value) return 'Le nom est requis';
  if (value.length < 2) return 'Minimum 2 caractères';
  if (value.length > 80) return 'Maximum 80 caractères';
  if (!/^[\p{L}\p{M}\s'.-]+$/u.test(value)) {
    return 'Caractères invalides (lettres, espaces, apostrophe, tiret)';
  }
  return '';
};

export const validateRegisterForm = ({ name, email, password }) => {
  const errors = {};
  const nameError = validateName(name);
  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);
  if (nameError) errors.name = nameError;
  if (emailError) errors.email = emailError;
  if (passwordError) errors.password = passwordError;
  return { valid: Object.keys(errors).length === 0, errors };
};

export const validateResetPasswordForm = ({ password, confirmPassword }) => {
  const errors = {};
  const passwordError = validatePassword(password);
  if (passwordError) errors.password = passwordError;
  if (!confirmPassword) errors.confirmPassword = 'Confirmez le mot de passe';
  else if (password !== confirmPassword) errors.confirmPassword = 'Les mots de passe ne correspondent pas';
  return { valid: Object.keys(errors).length === 0, errors };
};

/** Score 0–4 pour indicateur visuel (inscription / reset). */
export const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', color: '#e5e7eb' };
  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  score = Math.min(4, score);

  const levels = [
    { label: 'Très faible', color: '#ef4444' },
    { label: 'Faible', color: '#f97316' },
    { label: 'Moyen', color: '#eab308' },
    { label: 'Bon', color: '#22c55e' },
    { label: 'Fort', color: '#059669' },
  ];
  return { score, ...levels[score] };
};
