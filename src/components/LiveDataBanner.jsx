import React from 'react';
import { allowDemoFallback } from '../config/liveDataPolicy';

/**
 * Bandeau discret en dev quand les fallbacks démo sont actifs.
 * Masqué en mode VITE_STRICT_LIVE (prod par défaut).
 */
const LiveDataBanner = () => {
  if (allowDemoFallback()) return null;

  return (
    <div
      role="status"
      style={{
        background: 'linear-gradient(90deg, #ecfdf5, #f0fdf4)',
        borderBottom: '1px solid #bbf7d0',
        color: '#166534',
        fontSize: '0.8rem',
        fontWeight: 600,
        padding: '8px 16px',
        textAlign: 'center',
      }}
    >
      Mode données live — les données de démonstration sont désactivées.
    </div>
  );
};

export default LiveDataBanner;
