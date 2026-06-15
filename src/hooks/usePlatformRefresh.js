import { useEffect } from 'react';
import { PLATFORM_REFRESH_EVENT } from '../services/platformLiveService';

/**
 * Recharge les données de la page à chaque pulse plateforme (socket ou retour onglet).
 */
const usePlatformRefresh = (callback, deps = []) => {
  useEffect(() => {
    if (typeof callback !== 'function') return undefined;
    const handler = () => callback();
    window.addEventListener(PLATFORM_REFRESH_EVENT, handler);
    return () => window.removeEventListener(PLATFORM_REFRESH_EVENT, handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};

export default usePlatformRefresh;
