import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Navigation, Phone, Stethoscope, LocateFixed } from 'lucide-react';
import api from '../utils/api';
import { fetchPlatformRegions } from '../services/platformCitiesService';
import VetNearbyMap from './VetNearbyMap';

const DEFAULT_CENTER = { lat: 36.8065, lng: 10.1815 };

const SEARCH_MODES = {
  region: { id: 'region', label: 'Ma région' },
  gps: { id: 'gps', label: 'Ma position GPS' },
  manual: { id: 'manual', label: 'Choisir une région' },
};

const NearestVetCard = ({ compact = false }) => {
  const [vets, setVets] = useState([]);
  const [meta, setMeta] = useState(null);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('region');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [profileRegion, setProfileRegion] = useState('');
  const [geoError, setGeoError] = useState('');
  const [selectedVetId, setSelectedVetId] = useState(null);

  const loadVets = useCallback(async (params = {}) => {
    setLoading(true);
    setGeoError('');
    try {
      const res = await api.get('/veterinary/nearby', { params: { radius: 80, ...params } });
      const payload = res.data?.vets ? res.data : { vets: Array.isArray(res.data) ? res.data : [], meta: {} };
      setVets(payload.vets || []);
      setMeta(payload.meta || null);
      if (payload.vets?.[0]?.id) setSelectedVetId(payload.vets[0].id);
      if (payload.meta?.regions?.length) setRegions(payload.meta.regions);
      if (payload.meta?.clientRegion && !selectedRegion) {
        setSelectedRegion(payload.meta.clientRegion);
        setProfileRegion(payload.meta.clientRegion);
      }
    } catch (err) {
      console.error('Nearby vets error', err);
      setVets([]);
      setGeoError('Impossible de charger les vétérinaires.');
    } finally {
      setLoading(false);
    }
  }, [selectedRegion]);

  useEffect(() => {
    const init = async () => {
      let initialRegion = '';
      try {
        const [profileRes, regionsRes] = await Promise.all([
          api.get('/users/profile').catch(() => ({ data: {} })),
          fetchPlatformRegions(),
        ]);
        initialRegion = profileRes.data?.region || '';
        setProfileRegion(initialRegion);
        setSelectedRegion(initialRegion);
        if (regionsRes.regions?.length) setRegions(regionsRes.regions);
      } catch {
        /* ignore */
      }
      await loadVets(initialRegion ? { region: initialRegion } : {});
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const searchByRegion = async (region) => {
    setMode('region');
    setSelectedRegion(region);
    await loadVets({ region });
  };

  const searchByGps = () => {
    setMode('gps');
    if (!navigator.geolocation) {
      setGeoError('Géolocalisation non disponible sur cet appareil.');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        loadVets({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        setGeoError('Accès GPS refusé — recherche par région utilisée.');
        loadVets({ region: selectedRegion || profileRegion || 'Tunis' });
      },
      { timeout: 10000, maximumAge: 120000 }
    );
  };

  const searchManual = async () => {
    setMode('manual');
    if (!selectedRegion) {
      setGeoError('Sélectionnez une région.');
      return;
    }
    await loadVets({ region: selectedRegion });
    try {
      await api.put('/users/profile', { region: selectedRegion });
      setProfileRegion(selectedRegion);
    } catch {
      /* optional save */
    }
  };

  const nearest = vets.find((v) => v.id === selectedVetId) || vets[0];
  const others = vets.filter((v) => v.id !== nearest?.id).slice(0, compact ? 2 : 4);

  const modeLabel = {
    gps: 'votre position GPS',
    region: meta?.clientRegion ? `votre région (${meta.clientRegion})` : 'votre région',
    manual: selectedRegion ? `la région ${selectedRegion}` : 'région choisie',
    default: 'Tunis (par défaut)',
  }[meta?.searchMode || mode] || 'votre zone';

  const clientCenter = meta?.center
    ? {
        lat: meta.center.lat,
        lng: meta.center.lng,
        label: modeLabel,
      }
    : null;

  const openMaps = (vet) => {
    if (!vet?.lat || !vet?.lng) return;
    window.open(
      `https://www.google.com/maps?q=${vet.lat},${vet.lng}(${encodeURIComponent(vet.name || 'Vétérinaire')})`,
      '_blank'
    );
  };

  if (loading && !nearest) {
    return (
      <div style={styles.wrap}>
        <p style={styles.muted}>Recherche du vétérinaire le plus proche de {profileRegion || 'votre région'}…</p>
      </div>
    );
  }

  if (!nearest) {
    return (
      <div style={styles.wrap}>
        <p style={styles.muted}>Aucun vétérinaire partenaire trouvé dans votre zone.</p>
        {!profileRegion && (
          <Link to="/client-profile" style={styles.profileLink}>
            Renseignez votre région dans Mon Profil →
          </Link>
        )}
      </div>
    );
  }

  return (
    <div style={{ ...styles.wrap, ...(compact ? styles.wrapCompact : {}) }}>
      <div style={styles.header}>
        <Stethoscope size={22} style={{ color: '#0f766e' }} />
        <div style={{ flex: 1 }}>
          <h2 style={styles.title}>
            {compact ? 'Vétérinaire proche' : 'Vétérinaire le plus proche de chez vous'}
          </h2>
          <p style={styles.sub}>Basé sur {modeLabel}</p>
          {meta?.allRegionsCovered && (
            <p style={styles.coverageNote}>
              ✓ Au moins un vétérinaire partenaire par région ({meta.regionCoverage?.length || 8} zones)
            </p>
          )}
        </div>
      </div>

      <div style={styles.modeRow}>
        {Object.values(SEARCH_MODES).map((m) => (
          <button
            key={m.id}
            type="button"
            style={{ ...styles.modeBtn, ...(mode === m.id ? styles.modeBtnActive : {}) }}
            onClick={() => {
              if (m.id === 'gps') searchByGps();
              else if (m.id === 'region') searchByRegion(profileRegion || selectedRegion || 'Tunis');
              else setMode('manual');
            }}
          >
            {m.id === 'gps' ? <LocateFixed size={14} /> : null}
            {m.label}
          </button>
        ))}
      </div>

      {mode === 'manual' && (
        <div style={styles.regionPick}>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            style={styles.select}
          >
            <option value="">— Région —</option>
            {(regions.length ? regions : ['Tunis', 'Ariana', 'La Marsa', 'Lac', 'Manouba', 'Carthage', 'Le Kram', 'Sidi Bou Said']).map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <button type="button" style={styles.searchBtn} onClick={searchManual}>
            Rechercher
          </button>
        </div>
      )}

      {geoError ? <p style={styles.warn}>{geoError}</p> : null}

      <VetNearbyMap
        vets={vets}
        clientCenter={clientCenter}
        selectedVetId={selectedVetId}
        onSelectVet={setSelectedVetId}
        height={compact ? 240 : 380}
      />

      <div style={styles.legend}>
        <span><i style={styles.dotBlue} /> Vous</span>
        <span><i style={styles.dotTeal} /> Votre région</span>
        <span><i style={styles.dotPurple} /> Autre région</span>
        <span><i style={styles.dotOrange} /> Sélectionné</span>
      </div>

      <div style={styles.heroCard}>
        <div style={styles.badgeRow}>
          <span style={styles.badge}>{selectedVetId === vets[0]?.id ? 'Le plus proche' : 'Sélectionné'}</span>
          {nearest.sameRegion ? <span style={styles.regionBadge}>Votre région</span> : null}
        </div>
        <h3 style={styles.vetName}>{nearest.name}</h3>
        {nearest.region ? <p style={styles.region}>{nearest.region}</p> : null}
        {nearest.address ? (
          <p style={styles.line}>
            <MapPin size={14} /> {nearest.address}
          </p>
        ) : null}
        {nearest.phone ? (
          <p style={styles.line}>
            <Phone size={14} />{' '}
            <a href={`tel:${nearest.phone}`} style={styles.tel}>{nearest.phone}</a>
          </p>
        ) : null}
        {nearest.distance != null ? (
          <p style={styles.distance}>≈ {nearest.distance} km</p>
        ) : null}
        <div style={styles.actions}>
          <button type="button" style={styles.navBtn} onClick={() => openMaps(nearest)}>
            <Navigation size={16} /> Itinéraire
          </button>
          {!compact && (
            <Link to="/veterinary" style={styles.rdvLink}>
              Prendre RDV →
            </Link>
          )}
        </div>
      </div>

      {others.length > 0 ? (
        <div style={styles.others}>
          <p style={styles.othersTitle}>Autres vétérinaires à proximité</p>
          {others.map((v) => (
            <div
              key={v.id}
              style={{
                ...styles.otherRow,
                ...(selectedVetId === v.id ? styles.otherRowActive : {}),
              }}
              onClick={() => setSelectedVetId(v.id)}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedVetId(v.id)}
              role="button"
              tabIndex={0}
            >
              <div>
                <strong>{v.name}</strong>
                {v.sameRegion ? <span style={styles.miniRegionBadge}> · votre région</span> : null}
                {v.distance != null ? (
                  <span style={styles.otherDist}> — {v.distance} km</span>
                ) : null}
                {v.region ? <div style={styles.otherRegion}>{v.region}</div> : null}
              </div>
              <button type="button" style={styles.linkBtn} onClick={() => openMaps(v)}>
                Carte
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {!profileRegion && !compact && (
        <p style={styles.hint}>
          💡 <Link to="/client-profile" style={styles.profileLink}>Ajoutez votre région</Link> dans Mon Profil pour des résultats plus précis.
        </p>
      )}
    </div>
  );
};

const styles = {
  wrap: {
    marginBottom: 24,
    background: 'linear-gradient(135deg, rgba(15,118,110,0.08) 0%, rgba(230,126,34,0.06) 100%)',
    borderRadius: 20,
    padding: 20,
    border: '1px solid rgba(15,118,110,0.12)',
  },
  wrapCompact: { marginBottom: 16, padding: 16 },
  header: { display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14 },
  title: { margin: 0, fontSize: '1.1rem', fontWeight: 800 },
  sub: { margin: '4px 0 0', fontSize: 12, color: '#6b7280' },
  coverageNote: { margin: '6px 0 0', fontSize: 11, color: '#047857', fontWeight: 600 },
  muted: { margin: 0, color: '#6b7280', fontSize: 14 },
  warn: { margin: '0 0 10px', fontSize: 13, color: '#b45309' },
  modeRow: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  modeBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 12px',
    borderRadius: 10,
    border: '1px solid #d1d5db',
    background: 'white',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    color: '#374151',
  },
  modeBtnActive: { borderColor: '#0f766e', background: '#ccfbf1', color: '#0f766e' },
  regionPick: { display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  select: {
    flex: 1,
    minWidth: 140,
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid #e5e7eb',
    fontSize: 14,
  },
  searchBtn: {
    padding: '10px 16px',
    borderRadius: 10,
    border: 'none',
    background: '#0f766e',
    color: 'white',
    fontWeight: 700,
    cursor: 'pointer',
  },
  heroCard: {
    background: 'white',
    borderRadius: 16,
    padding: 18,
    boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
  },
  badgeRow: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 },
  badge: {
    fontSize: 11,
    fontWeight: 700,
    background: '#ccfbf1',
    color: '#0f766e',
    padding: '4px 10px',
    borderRadius: 999,
  },
  regionBadge: {
    fontSize: 11,
    fontWeight: 700,
    background: '#fef3c7',
    color: '#b45309',
    padding: '4px 10px',
    borderRadius: 999,
  },
  miniRegionBadge: { fontSize: 12, color: '#b45309', fontWeight: 600 },
  vetName: { margin: '0 0 6px', fontSize: '1.15rem', fontWeight: 800 },
  region: { margin: '0 0 10px', color: '#0f766e', fontWeight: 600, fontSize: 13 },
  line: {
    margin: '6px 0',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 14,
    color: '#4b5563',
  },
  tel: { color: '#0f766e', textDecoration: 'none' },
  distance: { margin: '12px 0', fontWeight: 700, color: '#e67e22', fontSize: 15 },
  actions: { display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginTop: 8 },
  navBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 16px',
    borderRadius: 12,
    border: 'none',
    background: '#0f766e',
    color: 'white',
    fontWeight: 700,
    cursor: 'pointer',
  },
  rdvLink: {
    fontSize: 14,
    fontWeight: 700,
    color: '#e67e22',
    textDecoration: 'none',
  },
  others: { marginTop: 16 },
  othersTitle: { margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: '#6b7280' },
  otherRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 12px',
    background: 'rgba(255,255,255,0.7)',
    borderRadius: 12,
    marginBottom: 8,
    cursor: 'pointer',
  },
  otherDist: { color: '#e67e22', fontWeight: 600, fontSize: 13 },
  otherRegion: { fontSize: 12, color: '#9ca3af' },
  linkBtn: {
    background: 'transparent',
    border: '1px solid #0f766e',
    color: '#0f766e',
    borderRadius: 10,
    padding: '6px 12px',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: 12,
  },
  hint: { margin: '14px 0 0', fontSize: 13, color: '#6b7280' },
  profileLink: { color: '#0f766e', fontWeight: 700, textDecoration: 'none' },
  legend: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12,
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 12,
  },
  dotBlue: {
    display: 'inline-block',
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: '#3b82f6',
    marginRight: 4,
    verticalAlign: 'middle',
  },
  dotTeal: {
    display: 'inline-block',
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: '#0f766e',
    marginRight: 4,
    verticalAlign: 'middle',
  },
  dotPurple: {
    display: 'inline-block',
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: '#6366f1',
    marginRight: 4,
    verticalAlign: 'middle',
  },
  dotOrange: {
    display: 'inline-block',
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: '#e67e22',
    marginRight: 4,
    verticalAlign: 'middle',
  },
  otherRowActive: {
    outline: '2px solid #e67e22',
    background: 'rgba(230,126,34,0.08)',
    cursor: 'pointer',
  },
};

export default NearestVetCard;
