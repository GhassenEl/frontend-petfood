import React from 'react';
import usePlatformRegions from '../hooks/usePlatformRegions';

const baseSelectStyle = {
  width: '100%',
  marginTop: 6,
  padding: '10px 12px',
  borderRadius: 10,
  border: '1px solid #e5e7eb',
  background: '#fff',
  fontSize: 14,
  boxSizing: 'border-box',
};

/**
 * Sélecteur de région/ville PetfoodTN — même liste pour client, livreur, vétérinaire, visiteur, modérateur.
 */
const RegionSelect = ({
  value = '',
  onChange,
  label = 'Région / ville',
  hint = '',
  disabled = false,
  allowEmpty = true,
  emptyLabel = '— Choisir une région —',
  name,
  style = {},
}) => {
  const { regions, loading } = usePlatformRegions();

  return (
    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', ...style }}>
      {label}
      <select
        name={name}
        value={value}
        disabled={disabled || (loading && !regions.length)}
        onChange={(e) => onChange?.(e.target.value)}
        aria-label={label}
        style={baseSelectStyle}
      >
        {allowEmpty && <option value="">{emptyLabel}</option>}
        {regions.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      {hint ? <p style={{ margin: '6px 0 0', fontSize: 12, color: '#64748b', fontWeight: 400 }}>{hint}</p> : null}
      {loading && !regions.length ? (
        <p style={{ margin: '6px 0 0', fontSize: 12, color: '#94a3b8', fontWeight: 400 }}>Chargement des régions…</p>
      ) : null}
    </label>
  );
};

export default RegionSelect;
