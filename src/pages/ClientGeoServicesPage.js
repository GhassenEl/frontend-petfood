import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Stethoscope, Store, Bell, RefreshCw } from 'lucide-react';
import usePlatformRefresh from '../hooks/usePlatformRefresh';
import { loadGeoServicesPack } from '../services/geoServicesService';
import IntelligentVetSearchPanel from '../components/IntelligentVetSearchPanel';
import PartnerStoresPanel from '../components/PartnerStoresPanel';
import LocalAlertsPanel from '../components/LocalAlertsPanel';
import './ClientGeoServices.css';

const TABS = [
  { id: 'vets', label: 'Vétérinaires', icon: Stethoscope },
  { id: 'stores', label: 'Animaleries', icon: Store },
  { id: 'alerts', label: 'Alertes locales', icon: Bell },
];

const ClientGeoServicesPage = () => {
  const [tab, setTab] = useState('vets');
  const [loading, setLoading] = useState(true);
  const [pack, setPack] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPack(await loadGeoServicesPack());
    } catch (e) {
      console.error(e);
      setPack(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  usePlatformRefresh(load, [load]);

  if (loading && !pack) {
    return <div className="geo-page"><p className="geo-loading">Chargement des services géolocalisés…</p></div>;
  }

  return (
    <div className="geo-page">
      <h1>
        <MapPin size={26} style={{ verticalAlign: 'middle', marginRight: 8 }} aria-hidden />
        Services géolocalisés
      </h1>
      <p className="geo-lead">
        Vétérinaires proches, carte interactive des animaleries partenaires et alertes locales
        (vaccinations, promotions, événements animaliers).
      </p>

      <div className="geo-toolbar">
        <div className="geo-tabs">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={`geo-tab${tab === id ? ' geo-tab--active' : ''}`}
              onClick={() => setTab(id)}
            >
              <Icon size={16} aria-hidden /> {label}
            </button>
          ))}
        </div>
        <button type="button" className="geo-btn geo-btn--ghost" onClick={load} disabled={loading}>
          <RefreshCw size={16} aria-hidden /> Actualiser
        </button>
      </div>

      {tab === 'vets' && (
        <IntelligentVetSearchPanel
          vets={pack?.vets || []}
          summary={pack?.vetSummary}
          availableCount={pack?.availableVetCount}
          clientCenter={pack?.clientCenter}
          onRefreshGps={load}
        />
      )}

      {tab === 'stores' && (
        <>
          <PartnerStoresPanel
            stores={pack?.stores || []}
            clientCenter={pack?.clientCenter}
          />
          <p className="geo-footer-link">
            <Link to="/store-locator">Voir aussi le localisateur magasins →</Link>
          </p>
        </>
      )}

      {tab === 'alerts' && (
        <LocalAlertsPanel
          alerts={pack?.alerts || []}
          summary={pack?.alertsSummary}
        />
      )}
    </div>
  );
};

export default ClientGeoServicesPage;
