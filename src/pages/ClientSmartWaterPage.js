import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { Droplets, Wifi, WifiOff, AlertTriangle, Plus, RefreshCw } from 'lucide-react';
import api from '../utils/api';
import {
  fetchWaterMonitorOverview,
  fetchWaterMonitorTracking,
  logWaterConsumption,
  recordWaterRefill,
} from '../services/ecosystemService';

const card = {
  background: '#fff',
  borderRadius: 16,
  padding: 20,
  boxShadow: '0 2px 14px rgba(15, 23, 42, 0.06)',
  marginBottom: 16,
};

const alertColor = { high: '#dc2626', medium: '#d97706', low: '#64748b' };

const petEmoji = { dog: '🐕', cat: '🐈', bird: '🐦', fish: '🐠', other: '🐾' };

const ClientSmartWaterPage = () => {
  const [overview, setOverview] = useState([]);
  const [pets, setPets] = useState([]);
  const [petId, setPetId] = useState('');
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [volumeInput, setVolumeInput] = useState('150');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/pets').then((r) => setPets(r.data || [])).catch(() => {});
    fetchWaterMonitorOverview()
      .then((d) => {
        const list = d.pets || [];
        setOverview(list);
        if (list[0]?.petId) setPetId(list[0].petId);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!petId && pets[0]?.id) setPetId(pets[0].id);
  }, [pets, petId]);

  const loadTracking = useCallback(async () => {
    if (!petId) return;
    setLoading(true);
    setMsg('');
    try {
      setTracking(await fetchWaterMonitorTracking(petId));
    } catch (e) {
      setMsg(e.response?.data?.error || 'Erreur chargement');
      setTracking(null);
    } finally {
      setLoading(false);
    }
  }, [petId]);

  useEffect(() => {
    if (petId) loadTracking();
  }, [petId, loadTracking]);

  const submitLog = async (e) => {
    e.preventDefault();
    const vol = Number(volumeInput);
    if (!petId || !vol) return;
    try {
      const r = await logWaterConsumption(petId, { volumeMl: vol });
      setTracking(r.tracking);
      setMsg('Consommation enregistrée');
    } catch (err) {
      setMsg(err.response?.data?.error || 'Erreur');
    }
  };

  const doRefill = async () => {
    if (!petId) return;
    try {
      const r = await recordWaterRefill(petId, { volumeMl: 1500 });
      setTracking(r.tracking);
      setMsg('Réservoir rechargé');
    } catch (err) {
      setMsg(err.response?.data?.error || 'Erreur recharge');
    }
  };

  const allPets = overview.length
    ? overview
    : pets.map((p) => ({ petId: p.id, name: p.name, type: p.type }));

  const pct = tracking?.percentOfTarget ?? 0;
  const ringColor = pct >= 80 ? '#10b981' : pct >= 50 ? '#0ea5e9' : '#f59e0b';

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
        <p style={{ margin: 0, fontSize: 12, opacity: 0.9, letterSpacing: 1 }}>SMART WATER MONITOR</p>
        <h1 style={{ margin: '8px 0', fontSize: 26, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Droplets size={28} /> Surveillance de la consommation d&apos;eau
        </h1>
        <p style={{ margin: 0, opacity: 0.9, fontSize: 14 }}>
          Fontaine connectée · objectifs hydratation · alertes intelligentes
        </p>
      </motion.div>

      {allPets.length > 1 && (
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
                background: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {petEmoji[p.type] || '🐾'} {p.name}
              {p.alert ? ' ⚠️' : ''}
            </button>
          ))}
        </div>
      )}

      {tracking && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
            <div style={{ ...card, textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: '#64748b' }}>Aujourd&apos;hui</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: ringColor }}>{tracking.todayMl} ml</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>objectif {tracking.targetMl} ml</div>
              <div
                style={{
                  marginTop: 8,
                  height: 8,
                  borderRadius: 4,
                  background: '#e2e8f0',
                  overflow: 'hidden',
                }}
              >
                <div style={{ width: `${pct}%`, height: '100%', background: ringColor, borderRadius: 4 }} />
              </div>
            </div>

            <div style={{ ...card }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                {tracking.monitor?.online ? (
                  <Wifi size={18} color="#10b981" />
                ) : (
                  <WifiOff size={18} color="#94a3b8" />
                )}
                <strong>{tracking.monitor?.name || 'Capteur'}</strong>
              </div>
              <div style={{ fontSize: 13, color: '#64748b' }}>
                Statut : {tracking.monitor?.status === 'online' ? 'En ligne' : 'Hors ligne'}
              </div>
              {tracking.monitor?.reservoirMl != null && (
                <div style={{ marginTop: 8, fontSize: 14 }}>
                  Réservoir : <strong>{tracking.monitor.reservoirMl} ml</strong>
                  <button
                    type="button"
                    onClick={doRefill}
                    style={{
                      marginLeft: 10,
                      padding: '4px 10px',
                      borderRadius: 8,
                      border: '1px solid #bae6fd',
                      background: '#f0f9ff',
                      cursor: 'pointer',
                      fontSize: 12,
                    }}
                  >
                    <RefreshCw size={12} style={{ verticalAlign: 'middle' }} /> Recharger
                  </button>
                </div>
              )}
            </div>

            <div style={{ ...card }}>
              <div style={{ fontSize: 12, color: '#64748b' }}>Moyenne 7 j</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{tracking.stats?.avg7dMl ?? 0} ml</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>pic {tracking.stats?.maxDayMl ?? 0} ml</div>
            </div>
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
                  padding: '10px 18px',
                  borderRadius: 10,
                  border: 'none',
                  background: '#0284c7',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
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
        <Link to="/pet-feeder" style={{ color: '#0284c7', marginRight: 16 }}>Distributeur IoT nourriture →</Link>
        <Link to="/pet-advice" style={{ color: '#0284c7' }}>Conseils hydratation →</Link>
      </p>
    </div>
  );
};

export default ClientSmartWaterPage;
