import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Truck, Store, Stethoscope, Navigation } from 'lucide-react';
import { fetchPublicCities } from '../services/platformCitiesService';
import { DEMO_CITIES_PACK } from '../utils/adminDemoData';
import CitySelector from '../components/CitySelector';
import usePlatformCity from '../hooks/usePlatformCity';

const card = {
  background: '#fff',
  borderRadius: 16,
  padding: 18,
  border: '1px solid #e2e8f0',
  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
};

const PlatformCitiesPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { selectedCity } = usePlatformCity();

  useEffect(() => {
    fetchPublicCities()
      .then(({ data: d }) => setData(d))
      .catch(() => setData(DEMO_CITIES_PACK))
      .finally(() => setLoading(false));
  }, []);

  const d = data || DEMO_CITIES_PACK;
  const cities = d.cities || [];
  const highlighted = cities.find((c) => c.name === selectedCity) || cities[0];

  const openMaps = (city) => {
    window.open(`https://www.google.com/maps?q=${city.lat},${city.lng}(${encodeURIComponent(`PetfoodTN ${city.name}`)})`, '_blank');
  };

  if (loading) {
    return <p style={{ padding: 24 }}>Chargement des villes PetfoodTN…</p>;
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '8px 0 40px' }}>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          marginBottom: 24,
          padding: '28px 24px',
          borderRadius: 20,
          background: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 50%, #5eead4 100%)',
          color: '#fff',
        }}
      >
        <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 800 }}>
          <MapPin size={28} style={{ verticalAlign: 'middle', marginRight: 8 }} />
          PetfoodTN dans votre ville
        </h1>
        <p style={{ margin: '0 0 16px', opacity: 0.95, lineHeight: 1.6 }}>
          Présents dans <strong>{d.stats?.activeCities || cities.length} villes</strong> à travers la Tunisie —
          commandez, retirez en point relais ou consultez un vétérinaire partenaire près de chez vous.
        </p>
        <CitySelector />
      </motion.div>

      {highlighted && (
        <div style={{ ...card, marginBottom: 20, borderLeft: '4px solid #0d9488' }}>
          <h2 style={{ margin: '0 0 8px', fontSize: 20 }}>Votre ville : {highlighted.name}</h2>
          <p style={{ margin: '0 0 12px', color: '#64748b' }}>{highlighted.governorate} — {highlighted.store?.address}</p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 14 }}>
            <span><Truck size={14} style={{ verticalAlign: 'middle' }} /> Livraison {highlighted.deliveryEnabled ? 'disponible' : 'bientôt'}</span>
            <span><Store size={14} style={{ verticalAlign: 'middle' }} /> Retrait {highlighted.pickupEnabled ? 'disponible' : '—'}</span>
            <span><Stethoscope size={14} style={{ verticalAlign: 'middle' }} /> {highlighted.stats?.vets || 0} vétérinaires</span>
          </div>
          <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" onClick={() => openMaps(highlighted)} style={btnPrimary}>Voir sur la carte</button>
            <Link to="/store-locator" style={btnGhost}>Magasins proches</Link>
            <Link to="/client-relay-points" style={btnGhost}>Points relais</Link>
          </div>
        </div>
      )}

      <h2 style={{ fontSize: 18, marginBottom: 12 }}>Toutes nos villes ({cities.length})</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
        {cities.map((city) => (
          <motion.div
            key={city.id || city.slug}
            whileHover={{ y: -4 }}
            style={{
              ...card,
              borderTop: city.name === selectedCity ? '3px solid #0d9488' : '3px solid #e2e8f0',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>{city.name}</h3>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>{city.governorate}</p>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 800, padding: '4px 8px', borderRadius: 999,
                background: (city.stats?.coverageScore || 0) >= 75 ? '#ecfdf5' : '#f8fafc',
                color: (city.stats?.coverageScore || 0) >= 75 ? '#047857' : '#64748b',
              }}
              >
                {city.stats?.coverageScore || 0}%
              </span>
            </div>
            <div style={{ marginTop: 12, fontSize: 12, color: '#475569', display: 'grid', gap: 4 }}>
              <span>🚚 {city.stats?.livreurs || 0} livreurs · 🏬 {city.stats?.vendors || 0} vendeurs</span>
              <span>🩺 {city.stats?.vets || 0} vétos · 📫 {city.stats?.relayPoints || 0} relais</span>
            </div>
            <button type="button" onClick={() => openMaps(city)} style={{ ...btnGhost, marginTop: 12, width: '100%', justifyContent: 'center' }}>
              <Navigation size={14} /> Itinéraire
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const btnPrimary = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '10px 16px',
  borderRadius: 10,
  border: 'none',
  background: '#0d9488',
  color: '#fff',
  fontWeight: 700,
  cursor: 'pointer',
  textDecoration: 'none',
};

const btnGhost = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '10px 16px',
  borderRadius: 10,
  border: '1px solid #e2e8f0',
  background: '#fff',
  color: '#0f172a',
  fontWeight: 600,
  cursor: 'pointer',
  textDecoration: 'none',
};

export default PlatformCitiesPage;
