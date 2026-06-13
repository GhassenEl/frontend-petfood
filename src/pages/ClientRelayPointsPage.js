import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Phone, Clock, Navigation } from 'lucide-react';
import { fetchRelayPoints } from '../services/ecosystemService';

const card = {
  background: '#fff',
  borderRadius: 16,
  padding: 18,
  boxShadow: '0 2px 14px rgba(15, 23, 42, 0.06)',
  marginBottom: 12,
};

const ClientRelayPointsPage = () => {
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
      setData(await fetchRelayPoints(params));
    } catch {
      setData(null);
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

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          marginBottom: 24,
          padding: '28px 24px',
          borderRadius: 20,
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
          color: '#fff',
        }}
      >
        <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 800 }}>
          <MapPin size={28} style={{ verticalAlign: 'middle', marginRight: 8 }} />
          Points relais partenaires
        </h1>
        <p style={{ margin: 0, opacity: 0.92 }}>
          Retirez votre commande dans une animalerie ou une clinique vétérinaire partenaire — retrait
          gratuit, pièce d&apos;identité requise.
        </p>
        {data?.kpis && (
          <div style={{ marginTop: 14, display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 14 }}>
            <span>🏪 {data.kpis.petShops} animaleries</span>
            <span>🩺 {data.kpis.vetClinics} cliniques</span>
          </div>
        )}
      </motion.div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <FilterBtn active={!typeFilter} onClick={() => setTypeFilter('')} label="Tous" />
        <FilterBtn active={typeFilter === 'pet_shop'} onClick={() => setTypeFilter('pet_shop')} label="Animaleries" />
        <FilterBtn active={typeFilter === 'vet_clinic'} onClick={() => setTypeFilter('vet_clinic')} label="Cliniques" />
        <Link to="/veterinary" style={{ marginLeft: 'auto', fontWeight: 700, color: '#1d4ed8', fontSize: 14 }}>
          Voir dans Santé & vétérinaire →
        </Link>
      </div>

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Chargement des points relais…</p>
      ) : !data?.points?.length ? (
        <p style={{ color: '#64748b' }}>Aucun point relais dans cette zone.</p>
      ) : (
        data.points.map((p) => (
          <div key={p.id} style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 17 }}>
                  {p.typeIcon} {p.name}
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{p.typeLabel}</div>
                {p.partnerCode && (
                  <div style={{ fontSize: 11, color: '#1d4ed8', marginTop: 4 }}>Code partenaire : {p.partnerCode}</div>
                )}
              </div>
              {p.distanceKm != null && (
                <span style={{ fontSize: 12, fontWeight: 700, color: '#059669', whiteSpace: 'nowrap' }}>
                  {p.distanceKm} km
                </span>
              )}
            </div>
            <p style={{ margin: '10px 0', fontSize: 14, color: '#475569' }}>
              <MapPin size={14} style={{ verticalAlign: 'middle' }} /> {p.address}
            </p>
            {p.phone && (
              <p style={{ margin: '4px 0', fontSize: 13 }}>
                <Phone size={14} style={{ verticalAlign: 'middle' }} /> {p.phone}
              </p>
            )}
            {p.hours && (
              <p style={{ margin: '4px 0', fontSize: 13, color: '#64748b' }}>
                <Clock size={14} style={{ verticalAlign: 'middle' }} /> {p.hours}
              </p>
            )}
            <button
              type="button"
              onClick={() => openMaps(p)}
              style={{
                marginTop: 10,
                padding: '8px 14px',
                borderRadius: 8,
                border: '1px solid #bfdbfe',
                background: '#eff6ff',
                color: '#1d4ed8',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              <Navigation size={14} style={{ verticalAlign: 'middle' }} /> Itinéraire
            </button>
          </div>
        ))
      )}

      <p style={{ marginTop: 20, fontSize: 13 }}>
        <Link to="/store-locator" style={{ color: '#1d4ed8' }}>
          Voir aussi nos magasins PetfoodTN →
        </Link>
      </p>
    </div>
  );
};

const FilterBtn = ({ active, onClick, label }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      padding: '8px 14px',
      borderRadius: 10,
      border: active ? '2px solid #3b82f6' : '1px solid #e2e8f0',
      background: active ? '#eff6ff' : '#fff',
      fontWeight: 700,
      cursor: 'pointer',
      fontSize: 13,
    }}
  >
    {label}
  </button>
);

export default ClientRelayPointsPage;
