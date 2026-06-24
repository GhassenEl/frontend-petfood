/**
 * Politique données live vs démo.
 * VITE_STRICT_LIVE=true → aucun fallback démo silencieux (prod / staging).
 */
export const isStrictLiveMode = () => {
  const raw = import.meta.env.VITE_STRICT_LIVE;
  if (raw === undefined || raw === '') return import.meta.env.PROD;
  return raw === 'true' || raw === '1';
};

export const allowDemoFallback = () => !isStrictLiveMode();

export const emptyList = () => [];

export const emptyStats = () => ({});
