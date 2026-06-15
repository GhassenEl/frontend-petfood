import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, RefreshCw, Save, Truck, Store, Stethoscope } from 'lucide-react';
import {
  fetchCitiesPack,
  updatePlatformCity,
} from '../services/platformCitiesService';
import { DEMO_CITIES_PACK } from '../utils/adminDemoData';
import DemoModePill from '../components/DemoModePill';
import usePlatformRefresh from '../hooks/usePlatformRefresh';
import './AdminPages.css';

const Kpi = ({ icon: Icon, label, value, color = '#0f172a' }) => (
  <div className="adm-card" style={{ borderTop: `3px solid ${color}`, textAlign: 'center' }}>
    <Icon size={20} color={color} />
    <div style={{ fontSize: 28, fontWeight: 900, color, marginTop: 8 }}>{value}</div>
    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{label}</div>
  </div>
);

const AdminCitiesHubPage = () => {
  const [pack, setPack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [govFilter, setGovFilter] = useState('all');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await fetchCitiesPack();
      setPack(data);
    } catch {
      setPack(DEMO_CITIES_PACK);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  usePlatformRefresh(load, [load]);

  const d = pack || DEMO_CITIES_PACK;
  const isDemo = d.mode === 'demo';

  const filtered = useMemo(() => {
    const rows = d.cities || [];
    if (govFilter === 'all') return rows;
    return rows.filter((c) => c.governorate === govFilter);
  }, [d.cities, govFilter]);

  const toggle = async (city, field) => {
    setBusy(true);
    try {
      const patch = { [field]: !city[field] };
      if (isDemo) {
        setPack((prev) => ({
          ...prev,
          cities: prev.cities.map((c) => (c.id === city.id ? { ...c, ...patch } : c)),
        }));
        setMsg(`${city.name} mis à jour (démo).`);
      } else {
        await updatePlatformCity(city.id, patch);
        await load();
        setMsg(`${city.name} mis à jour.`);
      }
    } catch {
      setMsg('Erreur mise à jour ville.');
    } finally {
      setBusy(false);
      setTimeout(() => setMsg(''), 3000);
    }
  };

  if (loading) {
    return <div className="adm-page"><p>Chargement du réseau villes…</p></div>;
  }

  return (
    <div className="adm-page" style={{ maxWidth: 1180 }}>
      <header className="adm-hero">
        <h1>
          <MapPin size={24} />
          Réseau multi-villes PetfoodTN
          {isDemo && <DemoModePill />}
        </h1>
        <p>
          La plateforme est déployée dans {d.stats?.activeCities} villes couvrant {d.stats?.governorates} gouvernorats —
          livraison, points relais, vendeurs et vétérinaires par zone.
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
          <button type="button" className="adm-btn adm-btn--ghost" onClick={load} disabled={busy}>
            <RefreshCw size={15} /> Actualiser
          </button>
          <Link to="/admin/regional-contacts" className="adm-btn adm-btn--ghost" style={{ textDecoration: 'none' }}>
            Contacts par région →
          </Link>
          <Link to="/store-locator" className="adm-btn adm-btn--ghost" style={{ textDecoration: 'none' }}>
            Carte magasins →
          </Link>
        </div>
      </header>

      {msg && <p className="adm-msg">{msg}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 20 }}>
        <Kpi icon={Building2} label="Villes actives" value={d.stats?.activeCities ?? 0} color="#0d9488" />
        <Kpi icon={MapPin} label="Gouvernorats" value={d.stats?.governorates ?? 0} color="#2563eb" />
        <Kpi icon={Truck} label="Zones livraison" value={d.stats?.deliveryZones ?? 0} color="#d97706" />
        <Kpi icon={Store} label="Points retrait" value={d.stats?.pickupPoints ?? 0} color="#7c3aed" />
      </div>

      <div className="adm-tabs" style={{ marginBottom: 16 }}>
        <button type="button" className={`adm-tab${govFilter === 'all' ? ' adm-tab--active' : ''}`} onClick={() => setGovFilter('all')}>
          Toutes
        </button>
        {(d.governorates || []).map((g) => (
          <button
            key={g}
            type="button"
            className={`adm-tab${govFilter === g ? ' adm-tab--active' : ''}`}
            onClick={() => setGovFilter(g)}
          >
            {g}
          </button>
        ))}
      </div>

      <div className="adm-card">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Ville</th>
              <th>Gouvernorat</th>
              <th>Couverture</th>
              <th>Livreurs</th>
              <th>Vendeurs</th>
              <th>Vétos</th>
              <th>Relais</th>
              <th>Livraison</th>
              <th>Retrait</th>
              <th>Active</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((city) => (
              <tr key={city.id}>
                <td><strong>{city.name}</strong></td>
                <td>{city.governorate}</td>
                <td>
                  <span style={{
                    fontWeight: 800,
                    color: (city.stats?.coverageScore || 0) >= 75 ? '#047857' : (city.stats?.coverageScore || 0) >= 50 ? '#b45309' : '#94a3b8',
                  }}
                  >
                    {city.stats?.coverageScore ?? 0}%
                  </span>
                </td>
                <td>{city.stats?.livreurs ?? 0}</td>
                <td>{city.stats?.vendors ?? 0}</td>
                <td>{city.stats?.vets ?? 0}</td>
                <td>{city.stats?.relayPoints ?? 0}</td>
                <td>
                  <button type="button" className="adm-btn adm-btn--sm" disabled={busy} onClick={() => toggle(city, 'deliveryEnabled')}>
                    {city.deliveryEnabled ? '✓ Oui' : 'Non'}
                  </button>
                </td>
                <td>
                  <button type="button" className="adm-btn adm-btn--sm" disabled={busy} onClick={() => toggle(city, 'pickupEnabled')}>
                    {city.pickupEnabled ? '✓ Oui' : 'Non'}
                  </button>
                </td>
                <td>
                  <button type="button" className={`adm-btn adm-btn--sm${city.isActive ? ' adm-btn--primary' : ''}`} disabled={busy} onClick={() => toggle(city, 'isActive')}>
                    {city.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="adm-card" style={{ marginTop: 16 }}>
        <h2><Stethoscope size={18} style={{ verticalAlign: 'middle' }} /> Déploiement national</h2>
        <p style={{ color: '#64748b', fontSize: 14 }}>
          PetfoodTN couvre le Grand Tunis, la côte (Sfax, Sousse, Nabeul, Hammamet), le nord (Bizerte),
          le centre (Kairouan, Gafsa) et le sud (Gabès, Djerba, Tozeur). Chaque ville dispose d&apos;un point
          PetfoodTN avec livraison et retrait partenaires.
        </p>
        <button type="button" className="adm-btn adm-btn--primary" disabled={busy} onClick={load}>
          <Save size={15} /> Synchroniser les stats
        </button>
      </div>
    </div>
  );
};

export default AdminCitiesHubPage;
