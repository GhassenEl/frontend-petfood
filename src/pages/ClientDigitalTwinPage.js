import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Dna, LayoutDashboard, Stethoscope, Utensils, Activity, Sparkles, RefreshCw,
} from 'lucide-react';
import usePlatformRefresh from '../hooks/usePlatformRefresh';
import { loadDigitalTwinPack } from '../services/digitalTwinService';
import DigitalTwinOverview from '../components/DigitalTwinOverview';
import DigitalTwinMedicalPanel from '../components/DigitalTwinMedicalPanel';
import DigitalTwinNutritionPanel from '../components/DigitalTwinNutritionPanel';
import DigitalTwinActivityPanel from '../components/DigitalTwinActivityPanel';
import DigitalTwinAiPanel from '../components/DigitalTwinAiPanel';
import './ClientDigitalTwin.css';

const TABS = [
  { id: 'overview', label: 'Vue d\'ensemble', icon: LayoutDashboard },
  { id: 'medical', label: 'Médical', icon: Stethoscope },
  { id: 'nutrition', label: 'Alimentation', icon: Utensils },
  { id: 'activity', label: 'Activité', icon: Activity },
  { id: 'ai', label: 'Recommandations IA', icon: Sparkles },
];

const ClientDigitalTwinPage = () => {
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [pack, setPack] = useState(null);
  const [petIndex, setPetIndex] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPack(await loadDigitalTwinPack());
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

  const twin = pack?.twins?.[petIndex] || null;

  if (loading && !pack) {
    return <div className="dtwin-page"><p className="dtwin-loading">Synchronisation du jumeau numérique…</p></div>;
  }

  if (!pack?.twins?.length) {
    return (
      <div className="dtwin-page">
        <p className="dtwin-loading">Aucun animal enregistré.</p>
        <Link to="/client-pets" className="dtwin-link">Ajouter un animal →</Link>
      </div>
    );
  }

  return (
    <div className="dtwin-page">
      <header className="dtwin-page-header">
        <h1>
          <Dna size={28} style={{ verticalAlign: 'middle', marginRight: 8 }} aria-hidden />
          Jumeau numérique
        </h1>
        <p className="dtwin-lead">
          Profil numérique complet de votre animal : données médicales, historique alimentaire,
          activité physique, recommandations IA et score de bien-être calculé automatiquement.
        </p>
      </header>

      <div className="dtwin-toolbar">
        <label className="dtwin-pet-select">
          <span>Animal</span>
          <select
            value={petIndex}
            onChange={(e) => setPetIndex(Number(e.target.value))}
            disabled={loading}
          >
            {pack.twins.map((t, i) => (
              <option key={t.petId} value={i}>
                {t.identity.emoji} {t.identity.name}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="dtwin-btn dtwin-btn--ghost" onClick={load} disabled={loading}>
          <RefreshCw size={16} aria-hidden /> Synchroniser
        </button>
        <Link to={`/client-pet-passport/${twin?.petId}`} className="dtwin-btn dtwin-btn--ghost">
          Passeport →
        </Link>
      </div>

      <div className="dtwin-tabs">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={`dtwin-tab${tab === id ? ' dtwin-tab--active' : ''}`}
            onClick={() => setTab(id)}
          >
            <Icon size={15} aria-hidden /> {label}
          </button>
        ))}
      </div>

      {tab === 'overview' && <DigitalTwinOverview twin={twin} />}
      {tab === 'medical' && <DigitalTwinMedicalPanel twin={twin} />}
      {tab === 'nutrition' && <DigitalTwinNutritionPanel twin={twin} />}
      {tab === 'activity' && <DigitalTwinActivityPanel twin={twin} />}
      {tab === 'ai' && <DigitalTwinAiPanel twin={twin} />}

      {twin?.lastSync && (
        <p className="dtwin-sync">
          Dernière sync : {new Date(twin.lastSync).toLocaleString('fr-FR')}
        </p>
      )}
    </div>
  );
};

export default ClientDigitalTwinPage;
