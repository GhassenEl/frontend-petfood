/** Politique auth — cookies HttpOnly en production. */

export const useHttpOnlyAuthCookie = () => {
  const raw = import.meta.env.VITE_AUTH_HTTPONLY;
  if (raw === 'true' || raw === '1') return true;
  if (raw === 'false' || raw === '0') return false;
  return import.meta.env.PROD;
};
