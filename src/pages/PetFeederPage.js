import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Wifi, WifiOff, Droplets, Thermometer, Scale, PawPrint,
  Plus, Trash2, Play, Calendar, AlertTriangle, Copy, Check,
  RefreshCw, Package, TrendingUp, Lightbulb, ToggleLeft, ToggleRight, Edit2,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import api from '../utils/api';

const statusColor = (s) => (s === 'online' ? '#059669' : '#9ca3af');

const alertStyle = (level) => {
  if (level === 'critical') return { bg: '#fef2f2', border: '#fecaca', color: '#b91c1c' };
  if (level === 'warning') return { bg: '#fffbeb', border: '#fde68a', color: '#b45309' };
  return { bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' };
};

const PetFeederPage = () => {
  const [feeders, setFeeders] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [feeder, setFeeder] = useState(null);
  const [plan, setPlan] = useState(null);
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [insights, setInsights] = useState([]);
  const [speciesGuide, setSpeciesGuide] = useState(null);
  const [feederMlPowered, setFeederMlPowered] = useState(false);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [grams, setGrams] = useState(30);
  const [logFilter, setLogFilter] = useState('all');
  const [history, setHistory] = useState([]);
  const [editingName, setEditingName] = useState(false);
  const [feederName, setFeederName] = useState('');
  const [scheduleForm, setScheduleForm] = useState({ time: '08:00', portionGrams: 30, label: 'Repas' });
  const pollRef = useRef(null);

  const loadFeeders = useCallback(async () => {
    try {
      const { data } = await api.get('/feeder');
      setFeeders(data || []);
      if (data?.length && !selectedId) setSelectedId(data[0].id);
    } catch (e) {
      console.error(e);
      setFeeders([]);
    }
  }, [selectedId]);

  const loadFeederDetail = useCallback(async (id, silent = false) => {
    if (!id) return;
    if (!silent) setLoading(true);
    try {
      const [detailRes, planRes, statsRes, alertsRes, insightsRes, historyRes, petsRes] = await Promise.all([
        api.get(`/feeder/${id}`),
        api.get(`/feeder/${id}/nutrition-plan`),
        api.get(`/feeder/${id}/stats?days=7`),
        api.get(`/feeder/${id}/alerts`),
        api.get(`/feeder/${id}/insights`),
        api.get(`/feeder/${id}/history?limit=40`),
        api.get('/pets').catch(() => ({ data: [] })),
      ]);
      setFeeder(detailRes.data);
      setFeederName(detailRes.data.name || '');
      setPlan(planRes.data);
      setStats(statsRes.data);
      setAlerts(alertsRes.data || []);
      setInsights(insightsRes.data?.insights || []);
      setSpeciesGuide(insightsRes.data?.speciesGuide || null);
      setFeederMlPowered(Boolean(insightsRes.data?.mlPowered));
      if (insightsRes.data?.speciesGuide?.suggestedPortionGrams) {
        setGrams(insightsRes.data.speciesGuide.suggestedPortionGrams);
      }
      setHistory(historyRes.data || []);
      setPets(petsRes.data || []);
      if (planRes.data?.portionGrams) setGrams(planRes.data.portionGrams);
    } catch (e) {
      console.error(e);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadFeeders();
      setLoading(false);
    })();
  }, [loadFeeders]);

  useEffect(() => {
    loadFeederDetail(selectedId);
  }, [selectedId, loadFeederDetail]);

  useEffect(() => {
    if (!selectedId) return undefined;
    pollRef.current = setInterval(() => loadFeederDetail(selectedId, true), 12000);
    return () => clearInterval(pollRef.current);
  }, [selectedId, loadFeederDetail]);

  const registerFeeder = async () => {
    setActionLoading(true);
    try {
      const { data } = await api.post('/feeder', { name: 'Mon distributeur' });
      await loadFeeders();
      setSelectedId(data.id);
    } catch (e) {
      window.alert(e?.response?.data?.error || 'Erreur enregistrement');
    } finally {
      setActionLoading(false);
    }
  };

  const saveFeederSettings = async () => {
    if (!selectedId) return;
    setActionLoading(true);
    try {
      await api.put(`/feeder/${selectedId}`, {
        name: feederName,
        petId: feeder?.petId || null,
      });
      setEditingName(false);
      await loadFeederDetail(selectedId, true);
    } catch (e) {
      window.alert('Mise à jour échouée');
    } finally {
      setActionLoading(false);
    }
  };

  const linkPet = async (petId) => {
    if (!selectedId) return;
    try {
      await api.put(`/feeder/${selectedId}`, { petId: petId || null });
      await loadFeederDetail(selectedId, true);
    } catch (e) {
      window.alert('Liaison animal échouée');
    }
  };

  const dispense = async () => {
    if (!selectedId) return;
    setActionLoading(true);
    try {
      await api.post(`/feeder/${selectedId}/dispense`, { grams });
      await loadFeederDetail(selectedId, true);
    } catch (e) {
      window.alert(e?.response?.data?.error || 'Commande échouée');
    } finally {
      setActionLoading(false);
    }
  };

  const markRefill = async () => {
    if (!selectedId) return;
    setActionLoading(true);
    try {
      await api.post(`/feeder/${selectedId}/refill`, { grams: 500 });
      await loadFeederDetail(selectedId, true);
    } catch (e) {
      window.alert('Enregistrement recharge échoué');
    } finally {
      setActionLoading(false);
    }
  };

  const applySchedules = async () => {
    if (!selectedId) return;
    setActionLoading(true);
    try {
      await api.post(`/feeder/${selectedId}/apply-schedules`);
      await loadFeederDetail(selectedId, true);
    } catch (e) {
      window.alert('Impossible d\'appliquer le planning');
    } finally {
      setActionLoading(false);
    }
  };

  const addSchedule = async (e) => {
    e.preventDefault();
    if (!selectedId) return;
    try {
      await api.post(`/feeder/${selectedId}/schedules`, scheduleForm);
      await loadFeederDetail(selectedId, true);
    } catch (err) {
      window.alert('Erreur ajout créneau');
    }
  };

  const toggleSchedule = async (scheduleId, enabled) => {
    try {
      await api.patch(`/feeder/schedules/${scheduleId}`, { enabled: !enabled });
      await loadFeederDetail(selectedId, true);
    } catch (e) {
      window.alert('Mise à jour créneau échouée');
    }
  };

  const deleteSchedule = async (scheduleId) => {
    try {
      await api.delete(`/feeder/schedules/${scheduleId}`);
      await loadFeederDetail(selectedId, true);
    } catch (e) {
      window.alert('Suppression échouée');
    }
  };

  const copyKey = () => {
    if (!feeder?.deviceKey) return;
    navigator.clipboard.writeText(feeder.deviceKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredLogs = history.filter((log) => {
    if (logFilter === 'all') return true;
    if (logFilter === 'dispense') return ['dispense', 'manual_request', 'dispense_failed'].includes(log.eventType);
    return log.eventType === logFilter;
  });

  const chartData = (stats?.consumptionByDay || []).map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
  }));

  if (loading && feeders.length === 0) {
    return (
      <div style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Chargement distributeur…</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          textAlign: 'center', marginBottom: 28, padding: '32px 20px',
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
          borderRadius: 24,
        }}
      >
        <h1 style={{ margin: '0 0 8px', fontSize: 32, fontWeight: 800, color: '#1e40af' }}>
          🍽️ Distributeur IoT
        </h1>
        <p style={{ margin: 0, color: '#64748b' }}>
          Nutrition automatique, capteurs en temps réel et insights intelligents (ESP32)
        </p>
      </motion.div>

      {feeders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, background: 'white', borderRadius: 20, border: '1px solid #e5e7eb' }}>
          <PawPrint size={48} color="#94a3b8" style={{ marginBottom: 16 }} />
          <p style={{ color: '#64748b', marginBottom: 20 }}>Aucun distributeur enregistré. Ajoutez votre ESP32 pour commencer.</p>
          <button type="button" onClick={registerFeeder} disabled={actionLoading} style={btnPrimary}>
            <Plus size={18} /> Ajouter un distributeur
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16, alignItems: 'center' }}>
            {feeders.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedId(f.id)}
                style={{
                  padding: '10px 16px', borderRadius: 14, cursor: 'pointer', fontWeight: 700,
                  border: selectedId === f.id ? '2px solid #2563eb' : '1px solid #e5e7eb',
                  background: selectedId === f.id ? '#eff6ff' : 'white',
                }}
              >
                {f.status === 'online' ? '🟢' : '⚫'} {f.name}
              </button>
            ))}
            <button type="button" onClick={registerFeeder} style={btnOutline} disabled={actionLoading}>
              <Plus size={16} /> Nouveau
            </button>
            <button
              type="button"
              onClick={() => loadFeederDetail(selectedId, false)}
              style={{ ...btnOutline, marginLeft: 'auto' }}
              title="Actualiser"
            >
              <RefreshCw size={16} /> Actualiser
            </button>
          </div>

          {feeder && (
            <>
              {/* Alertes */}
              {alerts.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                  {alerts.map((a, i) => {
                    const s = alertStyle(a.level);
                    return (
                      <div key={i} style={{ ...alertBox, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                        <AlertTriangle size={16} />
                        <div>
                          <strong>{a.title}</strong>
                          <div style={{ fontSize: 12, fontWeight: 400, marginTop: 2 }}>{a.message}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {speciesGuide && (
                <div style={{
                  marginBottom: 16, padding: '14px 18px', borderRadius: 14,
                  background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', border: '1px solid #a7f3d0',
                  display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div>
                    <strong style={{ color: '#065f46' }}>
                      Espèce : {speciesGuide.label} — {speciesGuide.suggestedPortionGrams} g / repas
                    </strong>
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: '#047857' }}>
                      Objectif {speciesGuide.dailyGrams} g/jour · {feederMlPowered ? 'IA XGBoost active' : 'Calcul nutritionnel'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {[speciesGuide.suggestedPortionGrams - 5, speciesGuide.suggestedPortionGrams, speciesGuide.suggestedPortionGrams + 5]
                      .filter((g) => g >= 3 && g <= 120)
                      .map((g) => (
                        <button key={g} type="button" onClick={() => setGrams(g)} style={{
                          padding: '6px 12px', borderRadius: 8, border: grams === g ? '2px solid #059669' : '1px solid #86efac',
                          background: grams === g ? '#d1fae5' : 'white', cursor: 'pointer', fontWeight: 700, fontSize: 12,
                        }}>
                          {g} g
                        </button>
                      ))}
                    <Link to="/client-products?category=animaux" style={{ fontSize: 12, color: '#0369a1', fontWeight: 700 }}>
                      🐾 Adopter un compagnon
                    </Link>
                  </div>
                </div>
              )}

              {/* KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
                <KpiCard label="Aujourd'hui" value={`${stats?.todayGrams ?? 0} g`} icon="📊" />
                <KpiCard label="7 jours" value={`${stats?.weekGrams ?? 0} g`} icon="📈" />
                <KpiCard label="Moyenne/jour" value={`${stats?.dailyAverage ?? 0} g`} icon="⚖️" />
                <KpiCard label="Distributions" value={stats?.dispenseCount ?? 0} icon="🍽️" />
                <KpiCard
                  label="Réservoir"
                  value={feeder.reservoirPercent != null ? `${feeder.reservoirPercent}%` : '—'}
                  icon="📦"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                {/* Paramètres distributeur */}
                <Card title="Configuration" icon={<Edit2 size={18} color="#6366f1" />}>
                  {editingName ? (
                    <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                      <input
                        value={feederName}
                        onChange={(e) => setFeederName(e.target.value)}
                        style={{ ...inputStyle, flex: 1 }}
                      />
                      <button type="button" onClick={saveFeederSettings} style={btnPrimary}>OK</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <strong>{feeder.name}</strong>
                      <button type="button" onClick={() => setEditingName(true)} style={btnSmall}><Edit2 size={14} /></button>
                    </div>
                  )}
                  <label style={labelStyle}>
                    Animal lié
                    <select
                      value={feeder.petId || ''}
                      onChange={(e) => linkPet(e.target.value || null)}
                      style={{ ...inputStyle, width: '100%', marginTop: 6 }}
                    >
                      <option value="">— Choisir un animal —</option>
                      {pets.map((p) => (
                        <option key={p.id} value={p.id}>{p.name} ({p.type})</option>
                      ))}
                    </select>
                  </label>
                  <div style={{ marginTop: 12, padding: 12, background: '#f8fafc', borderRadius: 12, fontSize: 12 }}>
                    <strong>Clé ESP32 :</strong>
                    <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center' }}>
                      <code style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{feeder.deviceKey}</code>
                      <button type="button" onClick={copyKey} style={btnSmall}>
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                </Card>

                {/* Statut + jauge réservoir */}
                <Card title="État du distributeur" icon={feeder.status === 'online' ? <Wifi color={statusColor(feeder.status)} /> : <WifiOff color="#9ca3af" />}>
                  <ReservoirGauge percent={feeder.reservoirPercent} isLow={feeder.isLowFood} />
                  <StatRow label="Statut" value={feeder.status === 'online' ? 'En ligne' : `Hors ligne (${feeder.offlineMinutes ?? '?'} min)`} />
                  <StatRow label="Animal détecté" value={feeder.animalPresent ? 'Oui 👀' : 'Non'} />
                  <StatRow label="Niveau ultrason" value={feeder.reservoirCm != null ? `${feeder.reservoirCm.toFixed(1)} cm` : '—'} icon={<Droplets size={14} />} />
                  <StatRow label="Balance" value={feeder.foodGrams != null ? `${feeder.foodGrams.toFixed(0)} g` : '—'} icon={<Scale size={14} />} />
                  <StatRow label="Température" value={feeder.temperature != null ? `${feeder.temperature}°C` : '—'} icon={<Thermometer size={14} />} />
                  <StatRow label="Humidité" value={feeder.humidity != null ? `${feeder.humidity}%` : '—'} />
                  <button type="button" onClick={markRefill} disabled={actionLoading} style={{ ...btnOutline, width: '100%', marginTop: 12 }}>
                    <Package size={16} /> Marquer réservoir rechargé
                  </button>
                </Card>

                {/* Insights IA */}
                <Card title="Insights nutrition" icon={<Lightbulb size={18} color="#f59e0b" />} wide={insights.length > 2}>
                  {insights.length === 0 ? (
                    <p style={{ color: '#94a3b8', fontSize: 14 }}>Liez un animal pour des recommandations personnalisées.</p>
                  ) : (
                    <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none' }}>
                      {insights.map((ins, i) => (
                        <li key={i} style={{ padding: '10px 12px', background: '#fffbeb', borderRadius: 12, marginBottom: 8, fontSize: 13, display: 'flex', gap: 8 }}>
                          <span>{ins.icon}</span>
                          <span>{ins.text}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>

                {/* Graphique consommation */}
                <Card title="Consommation (7 jours)" icon={<TrendingUp size={18} color="#059669" />} wide>
                  {chartData.length === 0 ? (
                    <p style={{ color: '#94a3b8' }}>Pas encore de données — distribuez ou attendez le planning auto.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={chartData}>
                        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} unit=" g" />
                        <Tooltip formatter={(v) => [`${v} g`, 'Consommé']} />
                        {plan?.dailyGrams && (
                          <ReferenceLine y={plan.dailyGrams} stroke="#f59e0b" strokeDasharray="4 4" label="Objectif/j" />
                        )}
                        <Bar dataKey="grams" fill="#2563eb" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </Card>

                {/* Distribution manuelle */}
                <Card title="Distribution manuelle" icon={<Play size={18} color="#059669" />}>
                  <p style={{ fontSize: 13, color: '#64748b', marginTop: 0 }}>
                    IR → servo → moteur → balance. Commande envoyée à l&apos;ESP32.
                  </p>
                  <label style={labelStyle}>
                    Quantité (grammes)
                    <input type="number" min={5} max={200} value={grams} onChange={(e) => setGrams(Number(e.target.value))} style={inputStyle} />
                  </label>
                  <button type="button" onClick={dispense} disabled={actionLoading || feeder.isLowFood} style={{ ...btnPrimary, width: '100%', marginTop: 12, opacity: feeder.isLowFood ? 0.5 : 1 }}>
                    Distribuer maintenant
                  </button>
                </Card>

                {/* Plan nutritionnel */}
                <Card title="Plan nutritionnel" icon={<PawPrint size={18} color="#e67e22" />}>
                  {plan ? (
                    <>
                      <StatRow label="Animal" value={plan.pet?.name || 'Non lié'} />
                      <StatRow label="Besoin journalier" value={`${plan.dailyGrams} g`} />
                      <StatRow label="Par repas" value={`${plan.portionGrams} g × ${plan.mealsPerDay}`} />
                      <ul style={{ fontSize: 13, color: '#475569', paddingLeft: 18 }}>
                        {plan.tips?.map((t, i) => <li key={i}>{t}</li>)}
                      </ul>
                      <button type="button" onClick={applySchedules} disabled={actionLoading} style={{ ...btnOutline, width: '100%', marginTop: 8 }}>
                        <Calendar size={16} /> Appliquer planning auto (8h / 18h)
                      </button>
                    </>
                  ) : (
                    <p style={{ color: '#94a3b8' }}>Ajoutez un animal dans Mon Profil.</p>
                  )}
                </Card>

                {/* Planning */}
                <Card title="Planning repas" icon={<Calendar size={18} color="#8b5cf6" />} wide>
                  <form onSubmit={addSchedule} style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
                    <input type="time" value={scheduleForm.time} onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })} style={{ ...inputStyle, width: 120 }} required />
                    <input type="number" min={5} max={200} value={scheduleForm.portionGrams} onChange={(e) => setScheduleForm({ ...scheduleForm, portionGrams: Number(e.target.value) })} style={{ ...inputStyle, width: 80 }} />
                    <input type="text" placeholder="Label" value={scheduleForm.label} onChange={(e) => setScheduleForm({ ...scheduleForm, label: e.target.value })} style={{ ...inputStyle, flex: 1, minWidth: 100 }} />
                    <button type="submit" style={btnPrimary}>Ajouter</button>
                  </form>
                  {(feeder.schedules || []).length === 0 ? (
                    <p style={{ color: '#94a3b8', fontSize: 14 }}>Aucun créneau — utilisez le planning auto.</p>
                  ) : (
                    feeder.schedules.map((s) => (
                      <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: s.enabled ? '#f8fafc' : '#f1f5f9', borderRadius: 12, marginBottom: 8, opacity: s.enabled ? 1 : 0.6 }}>
                        <span>
                          <strong>{s.time}</strong> — {s.portionGrams} g {s.label ? `(${s.label})` : ''}
                          {!s.enabled && ' — désactivé'}
                        </span>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button type="button" onClick={() => toggleSchedule(s.id, s.enabled)} style={btnSmall} title={s.enabled ? 'Désactiver' : 'Activer'}>
                            {s.enabled ? <ToggleRight size={18} color="#059669" /> : <ToggleLeft size={18} color="#94a3b8" />}
                          </button>
                          <button type="button" onClick={() => deleteSchedule(s.id)} style={btnDanger}><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))
                  )}
                </Card>

                {/* Journal filtré */}
                <Card title="Journal d'événements" icon={<Scale size={18} />} wide>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                    {[
                      { id: 'all', label: 'Tout' },
                      { id: 'dispense', label: 'Distributions' },
                      { id: 'alert', label: 'Alertes' },
                      { id: 'refill', label: 'Recharges' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setLogFilter(f.id)}
                        style={{
                          padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                          border: logFilter === f.id ? '2px solid #2563eb' : '1px solid #e2e8f0',
                          background: logFilter === f.id ? '#eff6ff' : 'white',
                        }}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                  {filteredLogs.length === 0 ? (
                    <p style={{ color: '#94a3b8' }}>Aucun événement.</p>
                  ) : (
                    filteredLogs.map((log) => (
                      <div key={log.id} style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13 }}>
                        <div style={{ fontWeight: 700, color: '#334155' }}>
                          {logEventLabel(log.eventType)}
                          {log.portionGrams ? ` — ${log.portionGrams} g` : ''}
                        </div>
                        <div style={{ color: '#64748b' }}>{log.message}</div>
                        <div style={{ color: '#94a3b8', fontSize: 11 }}>{new Date(log.createdAt).toLocaleString('fr-FR')}</div>
                      </div>
                    ))
                  )}
                </Card>
              </div>
            </>
          )}
        </>
      )}

      <div style={{ marginTop: 32, padding: 20, background: '#fffbeb', borderRadius: 16, border: '1px solid #fde68a', fontSize: 14, color: '#92400e' }}>
        <strong>ESP32 :</strong> HC-SR04, IR, HX711, DHT11, Servo, Moteur DC, LED RGB — voir <code>firmware/README.md</code>
      </div>
    </div>
  );
};

const logEventLabel = (type) => {
  const map = {
    dispense: '✅ Distribution',
    alert: '🔴 Alerte',
    manual_request: '📲 Demande manuelle',
    dispense_failed: '❌ Échec distribution',
    refill: '📦 Recharge réservoir',
    sensor: '📡 Capteur',
  };
  return map[type] || type;
};

const ReservoirGauge = ({ percent, isLow }) => {
  const pct = percent ?? 0;
  const color = isLow || pct < 25 ? '#ef4444' : pct < 50 ? '#f59e0b' : '#059669';
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginBottom: 6 }}>
        <span>Niveau réservoir</span>
        <strong style={{ color }}>{percent != null ? `${percent}%` : 'Inconnu'}</strong>
      </div>
      <div style={{ height: 12, background: '#e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 8, transition: 'width 0.4s' }} />
      </div>
    </div>
  );
};

const KpiCard = ({ label, value, icon }) => (
  <div style={{ background: 'white', borderRadius: 16, padding: '14px 16px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
    <div style={{ fontSize: 20 }}>{icon}</div>
    <div style={{ fontSize: 20, fontWeight: 800, color: '#1e293b', marginTop: 4 }}>{value}</div>
    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{label}</div>
  </div>
);

const Card = ({ title, icon, children, wide }) => (
  <div style={{
    gridColumn: wide ? '1 / -1' : undefined,
    background: 'white', borderRadius: 20, padding: 20,
    border: '1px solid #e5e7eb', boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
  }}>
    <h2 style={{ margin: '0 0 16px', fontSize: 17, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
      {icon} {title}
    </h2>
    {children}
  </div>
);

const StatRow = ({ label, value, icon }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 14, borderBottom: '1px solid #f8fafc' }}>
    <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>{icon} {label}</span>
    <strong style={{ color: '#1e293b' }}>{value}</strong>
  </div>
);

const btnPrimary = { padding: '12px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 };
const btnOutline = { padding: '10px 16px', background: 'white', color: '#2563eb', border: '2px solid #2563eb', borderRadius: 12, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 };
const btnSmall = { padding: 8, background: '#e2e8f0', border: 'none', borderRadius: 8, cursor: 'pointer' };
const btnDanger = { padding: 8, background: '#fef2f2', color: '#b91c1c', border: 'none', borderRadius: 8, cursor: 'pointer' };
const inputStyle = { padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 14, width: '100%' };
const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, color: '#475569' };
const alertBox = { display: 'flex', alignItems: 'flex-start', gap: 8, padding: 12, borderRadius: 12, marginBottom: 0, fontSize: 13, fontWeight: 600 };

export default PetFeederPage;
