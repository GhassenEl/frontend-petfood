/**
 * Politique données live vs démo.
 * VITE_STRICT_LIVE=true → aucun fallback démo (prod, Docker, staging).
 * En dev local sans cette variable : jeux démo autorisés si l'API renvoie des listes vides.
 */
export const isStrictLiveMode = () => {
  const raw = import.meta.env.VITE_STRICT_LIVE;
  if (raw === undefined || raw === '') {
    // Docker / build prod : toujours live
    return import.meta.env.PROD || import.meta.env.MODE === 'production';
  }
  return raw === 'true' || raw === '1';
};

export const allowDemoFallback = () => !isStrictLiveMode();

export const emptyList = () => [];

export const emptyStats = () => ({});
