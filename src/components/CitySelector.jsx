import React from 'react';
import usePlatformCity from '../hooks/usePlatformCity';

const CitySelector = ({ compact = false }) => {
  const { cities, selectedCity, setSelectedCity, loading } = usePlatformCity();

  if (loading && !cities.length) return null;

  return (
    <label
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: compact ? 6 : 8,
        padding: compact ? '6px 10px' : '8px 14px',
        borderRadius: 999,
        border: '1px solid #e2e8f0',
        background: '#fff',
        fontSize: compact ? 12 : 13,
        fontWeight: 600,
        color: '#0f172a',
        boxShadow: '0 1px 4px rgba(15,23,42,0.06)',
      }}
    >
      {!compact && <span style={{ color: '#64748b', fontWeight: 500 }}>Ville :</span>}
      <select
        value={selectedCity}
        onChange={(e) => setSelectedCity(e.target.value)}
        aria-label="Choisir votre ville"
        style={{
          border: 'none',
          background: 'transparent',
          fontWeight: 700,
          color: '#0f172a',
          cursor: 'pointer',
          maxWidth: compact ? 120 : 160,
        }}
      >
        {cities.map((c) => (
          <option key={c.id || c.slug || c.name} value={c.name}>
            {c.name}
          </option>
        ))}
      </select>
    </label>
  );
};

export default CitySelector;
