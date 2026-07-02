/**
 * Configuration runtime — dev local vs hébergement live (Docker, VPS, AWS).
 */
export const isProductionBuild = () => import.meta.env.PROD;

export const apiBaseUrl = () => import.meta.env.VITE_API_BASE || '/api';

export const socketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL;
  if (isProductionBuild()) return window.location.origin;
  return null;
};

export const mlApiBase = () => import.meta.env.VITE_ML_API_BASE || '/fastapi';

export const platformLabel = () => {
  if (isProductionBuild()) return 'Production live';
  return 'Développement local';
};

export default {
  isProductionBuild,
  apiBaseUrl,
  socketUrl,
  mlApiBase,
  platformLabel,
};
