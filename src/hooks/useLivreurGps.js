import { useEffect, useRef } from 'react';
import api from '../utils/api';

/**
 * Envoie la position GPS du livreur au backend toutes les ~45 s quand activé.
 */
export default function useLivreurGps(enabled = true, intervalMs = 45000) {
  const watchId = useRef(null);

  useEffect(() => {
    if (!enabled || typeof navigator === 'undefined' || !navigator.geolocation) return undefined;

    const send = (coords) => {
      api.post('/livreur/gps', { lat: coords.latitude, lng: coords.longitude }).catch(() => {});
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => send(pos.coords),
      () => {},
      { enableHighAccuracy: true, maximumAge: 15000 }
    );

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => send(pos.coords),
      () => {},
      { enableHighAccuracy: true, maximumAge: intervalMs, timeout: 20000 }
    );

    const timer = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (pos) => send(pos.coords),
        () => {},
        { enableHighAccuracy: true, maximumAge: intervalMs }
      );
    }, intervalMs);

    return () => {
      clearInterval(timer);
      if (watchId.current != null) navigator.geolocation.clearWatch(watchId.current);
    };
  }, [enabled, intervalMs]);
}
