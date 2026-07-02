import React from 'react';
import { allowDemoFallback, isStrictLiveMode } from '../config/liveDataPolicy';
import { usePlatformLive } from '../contexts/PlatformLiveContext';
import { platformLabel } from '../config/platformRuntime';
import './LiveDataBanner.css';

/**
 * Bandeau statut plateforme — API, WebSocket et mode live/démo.
 * Visible en production (live) ; en dev local affiche le mode démo si actif.
 */
const LiveDataBanner = () => {
  const { apiOnline, socketConnected, syncing, pulse, lastHealthCheck } = usePlatformLive();
  const strict = isStrictLiveMode();
  const demoAllowed = allowDemoFallback();

  if (demoAllowed && apiOnline) return null;

  const isLive = apiOnline && (socketConnected || pulse?.online || pulse?.mode === 'live');
  const status = !apiOnline ? 'offline' : isLive ? 'live' : 'degraded';

  const labels = {
    live: 'Plateforme live',
    degraded: 'API connectée — synchronisation…',
    offline: strict ? 'API hors ligne — données live indisponibles' : 'API hors ligne — mode dégradé',
  };

  return (
    <div className={`live-status-bar live-status-bar--${status}`} role="status" aria-live="polite">
      <span className={`live-status-bar__dot live-status-bar__dot--${status}`} aria-hidden />
      <span className="live-status-bar__text">
        {labels[status]}
        {syncing ? ' · actualisation…' : ''}
        {pulse?.activeUsers != null ? ` · ${pulse.activeUsers} en ligne` : ''}
      </span>
      <span className="live-status-bar__meta">
        {platformLabel()}
        {lastHealthCheck ? ` · ${new Date(lastHealthCheck).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}` : ''}
      </span>
    </div>
  );
};

export default LiveDataBanner;
