import React from 'react';
import { usePlatformLive } from '../contexts/PlatformLiveContext';

const PlatformLiveBadge = () => {
  const { pulse, socketConnected, syncing, isLive } = usePlatformLive();

  const label = syncing
    ? 'Synchronisation…'
    : isLive
      ? 'En direct'
      : socketConnected
        ? 'Connecté'
        : 'Hors ligne';

  const time = pulse?.serverTime
    ? new Date(pulse.serverTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null;

  return (
    <div
      className={`platform-live-badge${isLive ? ' platform-live-badge--live' : ''}`}
      title={time ? `Dernière mise à jour : ${time}` : 'Plateforme dynamique'}
      aria-live="polite"
    >
      <span className={`platform-live-badge__dot${isLive ? ' platform-live-badge__dot--pulse' : ''}`} aria-hidden />
      <span className="platform-live-badge__label">{label}</span>
      {pulse?.ordersToday != null && (
        <span className="platform-live-badge__meta">{pulse.ordersToday} cmd. jour</span>
      )}
    </div>
  );
};

export default PlatformLiveBadge;
