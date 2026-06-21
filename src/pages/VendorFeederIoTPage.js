import React, { useCallback, useEffect, useState } from 'react';
import { Cpu, Droplets, Thermometer, Play, Calendar, AlertTriangle, RefreshCw } from 'lucide-react';
import { getDemoFeederList, getDemoFeederBundle, DEMO_FEEDER_HISTORY } from '../utils/clientDemoData';
import './VendorFeederIoTPage.css';

const VendorFeederIoTPage = () => {
  const [feeders, setFeeders] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [feeder, setFeeder] = useState(null);
  const [history, setHistory] = useState([]);
  const [grams, setGrams] = useState(30);
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    const list = getDemoFeederList();
    setFeeders(list);
    const id = selectedId || list[0]?.id;
    if (id) {
      const bundle = getDemoFeederBundle(id);
      setSelectedId(id);
      setFeeder(bundle.feeder);
      setHistory(bundle.history || DEMO_FEEDER_HISTORY);
    }
  }, [selectedId]);

  useEffect(() => { load(); }, []);

  const selectFeeder = (id) => {
    const bundle = getDemoFeederBundle(id);
    setSelectedId(id);
    setFeeder(bundle.feeder);
    setHistory(bundle.history || DEMO_FEEDER_HISTORY);
  };

  const manualDispense = () => {
    setMsg(`Distribution manuelle : ${grams} g envoyée à ${feeder?.name || 'ESP32'}`);
    setHistory((h) => [{ id: `m-${Date.now()}`, type: 'dispense', grams, label: 'Manuel vendeur', createdAt: new Date().toISOString() }, ...h]);
    setTimeout(() => setMsg(''), 3000);
  };

  if (!feeder) return <div className="vfeeder-page"><p>Chargement ESP32…</p></div>;

  return (
    <div className="vfeeder-page">
      <header className="vfeeder-hero">
        <h1><Cpu size={24} /> Gestion IoT — Distributeurs intelligents</h1>
        <p>Surveillance ESP32, réservoir, température/humidité, distribution manuelle, planification et alertes.</p>
        <button type="button" className="vfeeder-btn" onClick={load}><RefreshCw size={14} /> Actualiser</button>
      </header>

      <div className="vfeeder-fleet">
        {feeders.map((f) => (
          <button key={f.id} type="button" className={`vfeeder-chip${f.id === selectedId ? ' is-active' : ''}`} onClick={() => selectFeeder(f.id)}>
            {f.name} · {f.status === 'online' ? '🟢' : '⚪'}
          </button>
        ))}
      </div>

      <div className="vfeeder-grid">
        <article className="vfeeder-card">
          <h3>ESP32 — {feeder.name}</h3>
          <p>Statut : <strong>{feeder.status === 'online' ? 'En ligne' : 'Hors ligne'}</strong></p>
          <p className="vfeeder-mono">Device: {feeder.deviceId || 'ESP32-FEED-001'}</p>
        </article>
        <article className="vfeeder-card">
          <h3><Droplets size={16} /> Réservoir</h3>
          <div className="vfeeder-gauge"><div style={{ width: `${feeder.reservoirPercent || 45}%` }} /></div>
          <p>{feeder.reservoirPercent || 45} % · {feeder.reservoirPercent < 20 && <span className="vfeeder-alert"><AlertTriangle size={12} /> Alerte réservoir vide</span>}</p>
        </article>
        <article className="vfeeder-card">
          <h3><Thermometer size={16} /> Environnement</h3>
          <p>Température : {feeder.temperature ?? 22.5} °C</p>
          <p>Humidité : {feeder.humidity ?? 48} %</p>
        </article>
      </div>

      <div className="vfeeder-actions">
        <section className="vfeeder-panel">
          <h3><Play size={16} /> Distribution manuelle</h3>
          <div className="vfeeder-row">
            <input type="number" min={5} max={200} value={grams} onChange={(e) => setGrams(Number(e.target.value))} /> g
            <button type="button" className="vfeeder-btn vfeeder-btn--primary" onClick={manualDispense}>Distribuer</button>
          </div>
          {msg && <p className="vfeeder-msg">{msg}</p>}
        </section>
        <section className="vfeeder-panel">
          <h3><Calendar size={16} /> Planification automatique</h3>
          <ul className="vfeeder-schedule">
            <li>08:00 — 30 g (Petit-déjeuner)</li>
            <li>12:30 — 35 g (Déjeuner)</li>
            <li>19:00 — 30 g (Dîner)</li>
          </ul>
          <p style={{ fontSize: 12, color: '#64748b' }}>Horaires synchronisés avec l&apos;ESP32 client.</p>
        </section>
      </div>

      <section className="vfeeder-panel">
        <h3>Journal des événements</h3>
        <ul className="vfeeder-log">
          {history.slice(0, 10).map((e) => (
            <li key={e.id}>
              <span>{e.type === 'alert' ? '⚠️' : e.type === 'dispense' ? '🍽️' : '📅'}</span>
              {e.message || `${e.label || 'Distribution'} — ${e.grams || ''} g`}
              <small>{new Date(e.createdAt).toLocaleString('fr-FR')}</small>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default VendorFeederIoTPage;
