import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { Droplets, Wifi, WifiOff, AlertTriangle, Plus, RefreshCw, Thermometer, Filter } from 'lucide-react';
import api from '../utils/api';
import {
  fetchWaterMonitorOverview,
  fetchWaterMonitorTracking,
  logWaterConsumption,
  recordWaterRefill,
  fetchWaterAlerts,
} from '../services/ecosystemService';
import WaterIoTAlertsPanel from '../components/WaterIoTAlertsPanel';
import {
  getDemoWaterOverview,
  getDemoWaterTracking,
  applyDemoWaterLog,
  applyDemoWaterRefill,
  DEMO_WATER_PETS,
} from '../utils/clientDemoData';

const card = {
  background: '#fff',
  borderRadius: 16,
  padding: 20,
  boxShadow: '0 2px 14px rgba(15, 23, 42, 0.06)',
  marginBottom: 16,
};

const alertColor = { high: '#dc2626', medium: '#d97706', low: '#64748b' };

const petEmoji = { dog: '🐕', cat: '🐈', bird: '🐦', fish: '🐠', other: '🐾' };

const SensorGauge = ({ label, value, unit, min, max, optimal, color }) => {
  if (value == null) return null;
  const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  const inRange = optimal && value >= optimal[0] && value <= optimal[1];
  const barColor = inRange ? color : '#f59e0b';
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginBottom: 4 }}>
        <span>{label}</span>
        <strong style={{ color: barColor }}>{value}{unit}</strong>
      </div>
      <div style={{ height: 8, background: '#e2e8f0', borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: barColor, borderRadius: 6 }} />
      </div>
    </div>
  );
};

const ClientSmartWaterPage = () => {
  const [overview, setOverview] = useState([]);
  const [pets, setPets] = useState([]);
  const [petId, setPetId] = useState('');
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [volumeInput, setVolumeInput] = useState('150');
  const [msg, setMsg] = useState('');
  const [demoMode, setDemoMode] = useState(false);
  const [allAlerts, setAllAlerts] = useState([]);
  const [alertSummary, setAlertSummary] = useState(null);

  const loadAlerts = useCallback(async () => {
    if (demoMode) {
      const demoAlerts = (overview.length ? overview : DEMO_WATER_PETS).flatMap((p) => {
        const t = getDemoWaterTracking(p.petId);
        return (t.alerts || []).map((a) => ({ ...a, petId: p.petId, petName: p.name }));
      });
      setAllAlerts(demoAlerts);
      setAlertSummary({
        count: demoAlerts.length,
        criticalCount: demoAlerts.filter((a) => a.severity === 'high').length,
      });
      return;
    }
    try {
      const data = await fetchWaterAlerts();
      setAllAlerts(data?.alerts || []);
      setAlertSummary({ count: data?.count, criticalCount: data?.criticalCount });
    } catch {
      setAllAlerts([]);
    }
  }, [demoMode, overview]);

  const applyDemoForPet = useCallback((id) => {
    const pid = id || 'demo-pet-1';
    setDemoMode(true);
    setOverview(DEMO_WATER_PETS);
    setPetId(pid);
    setTracking(getDemoWaterTracking(pid));
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [petsRes, overviewRes] = await Promise.all([
          api.get('/pets').catch(() => ({ data: [] })),
          fetchWaterMonitorOverview().catch(() => null),
        ]);
        if (cancelled) return;
        setPets(petsRes.data || []);
        const list = overviewRes?.pets || [];
        if (list.length > 0) {
          setDemoMode(false);
          setOverview(list);
          setPetId(list[0].petId);
        } else {
          applyDemoForPet('demo-pet-1');
        }
      } catch {
        if (!cancelled) applyDemoForPet('demo-pet-1');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [applyDemoForPet]);

  const loadTracking = useCallback(async (id, silent = false) => {
    if (!id) return;
    if (!silent) setLoading(true);
    setMsg('');
    if (demoMode || id.startsWith('demo-')) {
      setTracking(getDemoWaterTracking(id));
      if (!silent) setLoading(false);
      return;
    }
    try {
      setTracking(await fetchWaterMonitorTracking(id));
      setDemoMode(false);
    } catch (e) {
      applyDemoForPet(id);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [demoMode, applyDemoForPet]);

  useEffect(() => {
    if (petId) loadTracking(petId, true);
  }, [petId, loadTracking]);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts, tracking]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (petId) loadTracking(petId, true);
      loadAlerts();
    }, 45000);
    return () => clearInterval(timer);
  }, [petId, loadTracking, loadAlerts]);

  const submitLog = async (e) => {
    e.preventDefault();
    const vol = Number(volumeInput);
    if (!petId || !vol) return;
    if (demoMode) {
      setTracking((prev) => applyDemoWaterLog(prev, vol));
      setMsg('Consommation enregistrée (mode démo)');
      loadAlerts();
      return;
    }
    try {
      const r = await logWaterConsumption(petId, { volumeMl: vol });
      setTracking(r.tracking);
      setMsg('Consommation enregistrée');
      loadAlerts();
    } catch (err) {
      setTracking((prev) => applyDemoWaterLog(prev, vol));
      setDemoMode(true);
      setMsg('Consommation enregistrée (mode démo)');
    }
  };

  const doRefill = async () => {
    if (!petId) return;
    if (demoMode) {
      setTracking((prev) => applyDemoWaterRefill(prev, 1500));
      setMsg('Réservoir rechargé (mode démo)');
      return;
    }
    try {
      const r = await recordWaterRefill(petId, { volumeMl: 1500 });
      setTracking(r.tracking);
      setMsg('Réservoir rechargé');
    } catch (err) {
      setTracking((prev) => applyDemoWaterRefill(prev, 1500));
      setDemoMode(true);
      setMsg('Réservoir rechargé (mode démo)');
    }
  };

  const allPets = overview.length
    ? overview
    : pets.map((p) => ({ petId: p.id, name: p.name, type: p.type }));

  const pct = tracking?.percentOfTarget ?? (tracking?.targetMl
    ? Math.round((tracking.todayMl / tracking.targetMl) * 100)
    : 0);
  const ringColor = pct >= 80 ? '#10b981' : pct >= 50 ? '#0ea5e9' : '#f59e0b';
  const monitor = tracking?.monitor || {};

  if (loading && !tracking) {
    return <p style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Chargement du moniteur…</p>;
  }

  return (
    <div style={{ padding: 24, maxWidth: 960, margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          marginBottom: 20,
          padding: 24,
          borderRadius: 20,
          background: 'linear-gradient(135deg, #0c4a6e 0%, #0284c7 50%, #38bdf8 100%)',
          color: '#fff',
        }}
      >
        <p style={{ margin: 0, fontSize: 12, opacity: 0.9, letterSpacing: 1 }}>FONTAINE CONNECTÉE</p>
        <h1 style={{ margin: '8px 0', fontSize: 26, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Droplets size={28} /> Surveillance de la consommation d&apos;eau
        </h1>
        <p style={{ margin: 0, opacity: 0.9, fontSize: 14 }}>
          Fontaine connectée · capteurs en temps réel · alertes hydratation
        </p>
        {demoMode && (
          <p style={{
            margin: '12px 0 0', display: 'inline-block', padding: '6px 14px', borderRadius: 20,
            background: 'rgba(255,255,255,0.2)', fontSize: 13, fontWeight: 600,
          }}
          >
            Mode démo — fontaine simulée · actions locales
          </p>
        )}
        <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link to="/client-iot" style={{ fontSize: 13, fontWeight: 700, color: '#0c4a6e', textDecoration: 'none', padding: '8px 14px', background: 'rgba(255,255,255,0.9)', borderRadius: 10 }}>
            📡 Centre IoT
          </Link>
          <Link to="/pet-calories" style={{ fontSize: 13, fontWeight: 700, color: '#0c4a6e', textDecoration: 'none', padding: '8px 14px', background: 'rgba(255,255,255,0.9)', borderRadius: 10 }}>
            🔥 Calculateur calories
          </Link>
          <Link to="/pet-feeder" style={{ fontSize: 13, fontWeight: 700, color: '#0c4a6e', textDecoration: 'none', padding: '8px 14px', background: 'rgba(255,255,255,0.85)', borderRadius: 10 }}>
            🍽️ Distributeur nourriture
          </Link>
        </div>
      </motion.div>

      {allPets.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {allPets.map((p) => (
            <button
              key={p.petId}
              type="button"
              onClick={() => setPetId(p.petId)}
              style={{
                padding: '10px 16px',
                borderRadius: 12,
                border: petId === p.petId ? '2px solid #0284c7' : '1px solid #e2e8f0',
                background: petId === p.petId ? '#f0f9ff' : '#fff',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {petEmoji[p.type] || '🐾'} {p.name}
              {p.alert ? ' ⚠️' : ''}
            </button>
          ))}
          <button
            type="button"
            onClick={() => loadTracking(petId, false)}
            style={{
              marginLeft: 'auto', padding: '10px 14px', borderRadius: 12,
              border: '1px solid #bae6fd', background: '#fff', cursor: 'pointer', fontWeight: 600,
            }}
          >
            <RefreshCw size={14} style={{ verticalAlign: 'middle' }} /> Actualiser
          </button>
        </div>
      )}

      <WaterIoTAlertsPanel
        alerts={allAlerts.length ? allAlerts : (tracking?.alerts || []).map((a) => ({
          ...a,
          petId,
          petName: tracking?.petName,
        }))}
        summary={alertSummary}
        onSelectPet={(id) => setPetId(id)}
      />

      {tracking && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}>
            <div style={{ ...card, textAlign: 'center', marginBottom: 0 }}>
              <div style={{ fontSize: 12, color: '#64748b' }}>Aujourd&apos;hui</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: ringColor }}>{tracking.todayMl} ml</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>objectif {tracking.targetMl} ml</div>
              <div style={{ marginTop: 8, height: 8, borderRadius: 4, background: '#e2e8f0', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, pct)}%`, height: '100%', background: ringColor, borderRadius: 4 }} />
              </div>
            </div>
            <div style={{ ...card, marginBottom: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                {monitor.online ? <Wifi size={18} color="#10b981" /> : <WifiOff size={18} color="#94a3b8" />}
                <strong>{monitor.name || 'Capteur fontaine'}</strong>
              </div>
              <div style={{ fontSize: 13, color: '#64748b' }}>
                Statut : {monitor.status === 'online' ? 'En ligne' : 'Hors ligne'}
              </div>
              {monitor.reservoirMl != null && (
                <div style={{ marginTop: 8, fontSize: 14 }}>
                  Réservoir : <strong>{monitor.reservoirMl} ml</strong>
                  {monitor.reservoirCapacityMl ? ` / ${monitor.reservoirCapacityMl} ml` : ''}
                </div>
              )}
            </div>
            <div style={{ ...card, marginBottom: 0 }}>
              <div style={{ fontSize: 12, color: '#64748b' }}>Moyenne 7 j</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{tracking.stats?.avg7dMl ?? 0} ml</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>pic {tracking.stats?.maxDayMl ?? 0} ml</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 16 }}>
            <div style={{ ...card, marginBottom: 0 }}>
              <h2 style={{ margin: '0 0 12px', fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Thermometer size={18} color="#0ea5e9" /> Capteurs temps réel
              </h2>
              <SensorGauge label="Température eau" value={monitor.waterTempC} unit="°C" min={10} max={28} optimal={[16, 22]} color="#0ea5e9" />
              <SensorGauge
                label="Niveau réservoir"
                value={monitor.reservoirCapacityMl ? Math.round((monitor.reservoirMl / monitor.reservoirCapacityMl) * 100) : null}
                unit="%"
                min={0}
                max={100}
                optimal={[30, 100]}
                color="#0284c7"
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                <div style={{ padding: 10, background: '#f8fafc', borderRadius: 10, textAlign: 'center', fontSize: 12 }}>
                  <div style={{ fontSize: 18 }}>💧</div>
                  <strong>Débit</strong>
                  <div style={{ color: '#64748b' }}>{monitor.flowRateMlMin ?? 0} ml/min</div>
                </div>
                <div style={{ padding: 10, background: monitor.filterDaysLeft <= 7 ? '#fffbeb' : '#f8fafc', borderRadius: 10, textAlign: 'center', fontSize: 12 }}>
                  <div style={{ fontSize: 18 }}><Filter size={16} style={{ verticalAlign: 'middle' }} /></div>
                  <strong>Filtre</strong>
                  <div style={{ color: monitor.filterDaysLeft <= 7 ? '#b45309' : '#64748b' }}>
                    {monitor.filterDaysLeft ?? '—'} j restants
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={doRefill}
                style={{
                  width: '100%', marginTop: 12, padding: '10px 14px', borderRadius: 10,
                  border: '1px solid #bae6fd', background: '#f0f9ff', cursor: 'pointer', fontWeight: 700,
                }}
              >
                <RefreshCw size={14} style={{ verticalAlign: 'middle' }} /> Recharger réservoir
              </button>
            </div>

            {(tracking.insights || []).length > 0 && (
              <div style={{ ...card, marginBottom: 0 }}>
                <h2 style={{ margin: '0 0 12px', fontSize: 16 }}>💡 Insights hydratation</h2>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {tracking.insights.map((ins, i) => (
                    <li key={i} style={{ padding: '10px 12px', background: '#f0f9ff', borderRadius: 12, marginBottom: 8, fontSize: 13, display: 'flex', gap: 8 }}>
                      <span>{ins.icon}</span>
                      <span>{ins.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {(tracking.alerts || []).length > 0 && (
            <div style={{ ...card, background: '#fffbeb' }}>
              {tracking.alerts.map((a, i) => (
                <p key={i} style={{ margin: i ? '8px 0 0' : 0, color: alertColor[a.severity] || '#64748b', fontSize: 14 }}>
                  <AlertTriangle size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                  {a.message}
                </p>
              ))}
            </div>
          )}

          <div style={card}>
            <h2 style={{ margin: '0 0 12px', fontSize: 18 }}>Consommation aujourd&apos;hui (par heure)</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={tracking.hourlyToday || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={2} />
                <YAxis tick={{ fontSize: 11 }} unit=" ml" />
                <Tooltip formatter={(v) => [`${v} ml`, 'Consommé']} />
                <Bar dataKey="volumeMl" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={card}>
            <h2 style={{ margin: '0 0 12px', fontSize: 18 }}>Historique (14 derniers jours)</h2>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={tracking.series || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`${v} ml`, 'Total jour']} />
                <ReferenceLine y={tracking.targetMl} stroke="#94a3b8" strokeDasharray="4 4" label="Objectif" />
                <Line type="monotone" dataKey="totalMl" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={card}>
            <h2 style={{ margin: '0 0 12px', fontSize: 16 }}>Saisie manuelle</h2>
            <form onSubmit={submitLog} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <label style={{ flex: '1 1 120px' }}>
                <span style={{ fontSize: 12, color: '#64748b' }}>Volume (ml)</span>
                <input
                  type="number"
                  min={10}
                  max={2000}
                  value={volumeInput}
                  onChange={(e) => setVolumeInput(e.target.value)}
                  style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 10, border: '1px solid #e2e8f0' }}
                />
              </label>
              <button
                type="submit"
                style={{
                  padding: '10px 18px', borderRadius: 10, border: 'none',
                  background: '#0284c7', color: '#fff', fontWeight: 700, cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                }}
              >
                <Plus size={16} /> Ajouter
              </button>
            </form>
            {tracking.hydrationTip && (
              <p style={{ marginTop: 12, fontSize: 13, color: '#0369a1' }}>💡 {tracking.hydrationTip}</p>
            )}
          </div>
        </>
      )}

      {msg && <p style={{ color: '#059669', fontWeight: 600 }}>{msg}</p>}

      {!tracking && !loading && (
        <div style={{ ...card, textAlign: 'center' }}>
          <p>Aucun animal ou capteur configuré.</p>
          <Link to="/client-profile" style={{ color: '#0284c7' }}>Ajouter un animal →</Link>
        </div>
      )}

      <p style={{ fontSize: 13, marginTop: 16 }}>
        <Link to="/pet-advice" style={{ color: '#0284c7' }}>Conseils hydratation →</Link>
      </p>
    </div>
  );
};

export default ClientSmartWaterPage;
