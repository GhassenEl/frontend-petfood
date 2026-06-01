/**
 * Charge l'API Google Maps à la demande (pattern recommandé : loading=async).
 * Utiliser uniquement sur les pages qui en ont besoin.
 */
const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || '';

let mapsLoadPromise = null;

export const loadGoogleMaps = () => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Maps indisponible côté serveur'));
  }

  if (window.google?.maps) {
    return Promise.resolve(window.google.maps);
  }

  if (!MAPS_KEY || MAPS_KEY.includes('DUMMY')) {
    return Promise.reject(new Error('Clé Google Maps non configurée (VITE_GOOGLE_MAPS_KEY)'));
  }

  if (!mapsLoadPromise) {
    mapsLoadPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(MAPS_KEY)}&libraries=places&loading=async&callback=__petfoodMapsInit`;
      script.async = true;
      script.defer = true;
      script.onerror = () => reject(new Error('Échec chargement Google Maps'));

      window.__petfoodMapsInit = () => {
        window.googleMapsLoaded = true;
        resolve(window.google.maps);
        delete window.__petfoodMapsInit;
      };

      document.head.appendChild(script);
    });
  }

  return mapsLoadPromise;
};

export default loadGoogleMaps;
