import React, { useCallback, useEffect, useState } from 'react';
import { MapPin, Phone, Clock, Navigation } from 'lucide-react';
import { fetchRelayPoints } from '../services/ecosystemService';
import { DEMO_RELAY_POINTS } from '../utils/clientDemoData';

const card = {
  background: '#fff',
  borderRadius: 14,
  padding: 16,
  boxShadow: '0 2px 12px rgba(15, 23, 42, 0.06)',
  marginBottom: 10,
};

const FilterBtn = ({ active, onClick, label }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      padding: '8px 14px',
      borderRadius: 999,
      border: active ? '2px solid #1d4ed8' : '1px solid #e2e8f0',
      background: active ? '#eff6ff' : '#fff',
      fontWeight: 700,
      fontSize: 13,
      cursor: 'pointer',
    }}
  >
    {label}
  </button>
);

/** Points relais — affichage informatif (retrait gratuit, sans paiement en ligne). */
const ClientRelayPointsPanel = ({ compact = false }) => {
  const [data, setData] = useState(null);
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (lat, lng) => {
    setLoading(true);
    try {
      const params = {};
      if (typeFilter) params.type = typeFilter;
      if (lat != null && lng != null) {
        params.lat = lat;
        params.lng = lng;
        params.radius = 80;
      }
      const result = await fetchRelayPoints(params);
      setData(result?.points?.length ? result : { points: DEMO_RELAY_POINTS, kpis: { petShops: 1, vetClinics: 1 } });
    } catch {
      setData({ points: DEMO_RELAY_POINTS, kpis: { petShops: 1, vetClinics: 1 } });
    } finally {
      setLoading(false);
    }
  }, [typeFilter]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => load(pos.coords.latitude, pos.coords.longitude),
        () => load(36.8065, 10.1815),
        { timeout: 8000 }
      );
    } else {
      load(36.8065, 10.1815);
    }
  }, [load]);

  const openMaps = (p) => {
    if (p.lat == null) return;
    window.open(
      `https://www.google.com/maps?q=${p.lat},${p.lng}(${encodeURIComponent(p.name)})`,
      '_blank'
    );
  };

  const points = data?.points || [];

  return (
    <section style={{ marginTop: compact ? 0 : 24 }}>
      {!compact && (
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPin size={22} color="#1d4ed8" />
            Points relais partenaires
          </h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>
            Retrait gratuit en animalerie ou clinique vétérinaire — pièce d&apos;identité requise.
          </p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <FilterBtn active={!typeFilter} onClick={() => setTypeFilter('')} label="Tous" />
        <FilterBtn active={typeFilter === 'pet_shop'} onClick={() => setTypeFilter('pet_shop')} label="Animaleries" />
        <FilterBtn active={typeFilter === 'vet_clinic'} onClick={() => setTypeFilter('vet_clinic')} label="Cliniques" />
      </div>

      {loading ? (
        <p style={{ color: '#94a3b8', fontSize: 14 }}>Chargement des points relais…</p>
      ) : points.length === 0 ? (
        <p style={{ color: '#64748b', fontSize: 14 }}>Aucun point relais dans cette zone.</p>
      ) : (
        points.slice(0, compact ? 3 : undefined).map((p) => (
          <div key={p.id} style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: compact ? 15 : 17 }}>
                  {p.typeIcon} {p.name}
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{p.typeLabel}</div>
              </div>
              {p.distanceKm != null && (
                <span style={{ fontSize: 12, fontWeight: 700, color: '#059669', whiteSpace: 'nowrap' }}>
                  {p.distanceKm} km
                </span>
              )}
            </div>
            <p style={{ margin: '8px 0', fontSize: 13, color: '#475569' }}>
              <MapPin size={13} style={{ verticalAlign: 'middle' }} /> {p.address}
            </p>
            {p.hours && (
              <p style={{ margin: '4px 0', fontSize: 12, color: '#64748b' }}>
                <Clock size={12} style={{ verticalAlign: 'middle' }} /> {p.hours}
              </p>
            )}
            {p.phone && (
              <p style={{ margin: '4px 0', fontSize: 12, color: '#64748b' }}>
                <Phone size={12} style={{ verticalAlign: 'middle' }} /> {p.phone}
              </p>
            )}
            <button
              type="button"
              onClick={() => openMaps(p)}
              style={{
                marginTop: 8,
                padding: '6px 12px',
                borderRadius: 8,
                border: '1px solid #bfdbfe',
                background: '#eff6ff',
                color: '#1d4ed8',
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Navigation size={12} /> Itinéraire
            </button>
          </div>
        ))
      )}
    </section>
  );
};

export default ClientRelayPointsPanel;
