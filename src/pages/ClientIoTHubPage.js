import React, { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Wifi, AlertTriangle, ChevronRight, Cpu, RefreshCw, Activity,
  Calendar, Bell,
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { fetchIoTPack } from '../services/iotService';
import IoTDeviceCard from '../components/IoTDeviceCard';
import IoTInsightsPanel from '../components/IoTInsightsPanel';
import IoTSensorTimelinePanel from '../components/IoTSensorTimelinePanel';
import IoTAutomationRulesPanel from '../components/IoTAutomationRulesPanel';
import IoTFoodQualityCamPanel from '../components/IoTFoodQualityCamPanel';
import AdvancedIoTDevicesPanel from '../components/AdvancedIoTDevicesPanel';
import DemoModePill from '../components/DemoModePill';
import usePlatformRefresh from '../hooks/usePlatformRefresh';
import './ClientComplaintsPage.css';
import './ClientIoTHub.css';

const card = {
  background: '#fff',
  borderRadius: 16,
  padding: 20,
  boxShadow: '0 2px 14px rgba(15, 23, 42, 0.06)',
  border: '1px solid #f1f5f9',
};

const TABS = [
  { id: 'dashboard', label: 'Tableau de bord' },
  { id: 'food-quality', label: 'Qualité croquettes 📷' },
  { id: 'advanced', label: 'IoT avancé ⚡' },
  { id: 'intelligence', label: 'Intelligence IA' },
  { id: 'devices', label: 'Appareils' },
  { id: 'alerts', label: 'Alertes' },
  { id: 'automations', label: 'Automatisations' },
];

const SEV = { high: '#dc2626', medium: '#d97706', low: '#64748b' };

const HealthRing = ({ score }) => {
  const color = score >= 80 ? '#059669' : score >= 60 ? '#d97706' : '#dc2626';
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: 88, height: 88, borderRadius: '50%', margin: '0 auto',
        background: `conic-gradient(${color} ${score * 3.6}deg, #e2e8f0 0)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      >
        <div style={{
          width: 68, height: 68, borderRadius: '50%', background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column',
        }}
        >
          <span style={{ fontSize: 22, fontWeight: 900, color }}>{score}</span>
          <span style={{ fontSize: 9, color: '#64748b' }}>/100</span>
        </div>
      </div>
      <p style={{ margin: '8px 0 0', fontSize: 12, fontWeight: 700, color: '#475569' }}>Santé IoT</p>
    </div>
  );
};

const IoTModuleCard = ({ to, icon, title, subtitle, status, statusColor, badge }) => (
  <Link to={to} style={{ ...card, display: 'block', textDecoration: 'none', color: 'inherit' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
      <div>
        <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
        <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 800 }}>{title}</h3>
        <p style={{ margin: 0, fontSize: 13, color: '#64748b', lineHeight: 1.45 }}>{subtitle}</p>
        {badge && <span style={{ display: 'inline-block', marginTop: 10, fontSize: 11, fontWeight: 700, color: '#7c3aed', background: '#f5f3ff', padding: '4px 10px', borderRadius: 999 }}>{badge}</span>}
      </div>
      <ChevronRight size={20} color="#94a3b8" />
    </div>
    {status && <p style={{ margin: '14px 0 0', fontSize: 13, fontWeight: 700, color: statusColor || '#475569' }}>{status}</p>}
  </Link>
);

const ClientIoTHubPage = () => {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState('dashboard');
  const [pack, setPack] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPack(await fetchIoTPack());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  usePlatformRefresh(load, [load]);

  useEffect(() => {
    const t = searchParams.get('tab');
    if (t && TABS.some((x) => x.id === t)) setTab(t);
  }, [searchParams]);

  const d = pack || {};
  const c = d.counts || {};

  const feederChart = (d.telemetry?.feederGrams7d || []).map((g, i) => ({
    day: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'][i] || `J${i + 1}`,
    grams: g,
  }));

  const waterChart = (d.telemetry?.waterMl7d || []).map((ml, i) => ({
    day: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'][i] || `J${i + 1}`,
    ml,
  }));

  return (
    <div className="cc-page iot-hub">
      <header className="cc-hero" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #0ea5e9 100%)',
        color: 'white', borderRadius: 20, marginBottom: 24,
      }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 800 }}>📡 Centre IoT & connecté</h1>
            <p style={{ margin: 0, opacity: 0.9, maxWidth: 560, lineHeight: 1.5 }}>
              Distributeur ESP32, ESP32-CAM qualité croquettes, fontaines, routines, alertes et automatisations — pilotage unifié.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {d.mode === 'demo' && <DemoModePill />}
            <HealthRing score={d.healthScore || 0} />
            <button type="button" onClick={load} disabled={loading} style={btnLight}>
              <RefreshCw size={16} /> Actualiser
            </button>
          </div>
        </div>
      </header>

      <div className="iot-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`iot-tab${tab === t.id ? ' is-active' : ''}`}
          >
            {t.label}
            {t.id === 'alerts' && c.alerts > 0 && (
              <span className="iot-tab-badge">{c.alerts}</span>
            )}
            {t.id === 'intelligence' && (d.intelligence?.insightCount || 0) > 0 && (
              <span className="iot-tab-badge">{d.intelligence.insightCount}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#94a3b8', padding: 32 }}>Synchronisation des appareils…</p>
      ) : (
        <>
          {tab === 'dashboard' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
                <Stat value={`${c.feedersOnline || 0}/${c.feeders || 0}`} label="Distributeurs" color="#059669" />
                <Stat value={`${c.feederCamsOnline ?? 1}/${c.feederCams ?? 1}`} label="ESP32-CAM" color="#7c3aed" />
                <Stat value={`${c.waterOnline || 0}/${c.waterMonitors || 0}`} label="Fontaines" color="#0ea5e9" />
                <Stat value={c.alerts || 0} label="Alertes actives" color="#f59e0b" />
                <Stat value={c.routinesToday || 0} label="Routines/jour" color="#7c3aed" />
              </div>

              {feederChart.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 20 }}>
                  <div style={card}>
                    <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Activity size={16} color="#059669" /> Croquettes — 7 jours (g)
                    </h3>
                    <ResponsiveContainer width="100%" height={140}>
                      <BarChart data={feederChart}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar dataKey="grams" fill="#059669" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={card}>
                    <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Activity size={16} color="#0ea5e9" /> Hydratation — 7 jours (ml)
                    </h3>
                    <ResponsiveContainer width="100%" height={140}>
                      <LineChart data={waterChart}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="ml" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {(d.routines || []).length > 0 && (
                <div style={{ ...card, marginBottom: 20 }}>
                  <h3 style={{ margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 15 }}>
                    <Calendar size={18} color="#7c3aed" /> Routines du jour
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {d.routines.slice(0, 6).map((r, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: '#f8fafc', borderRadius: 10 }}>
                        <span style={{ fontWeight: 800, fontSize: 13, color: '#1e40af', minWidth: 48 }}>{r.time}</span>
                        <span style={{ flex: 1, fontSize: 13 }}>{r.label}</span>
                        <span style={{ fontSize: 12, color: '#64748b' }}>{r.action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16, marginBottom: 24 }}>
                <IoTModuleCard to="/pet-feeder" icon="🍽️" title="Distributeur IoT" subtitle="ESP32, portions, capteurs niveau/température." status={`${c.feedersOnline || 0} en ligne`} statusColor="#059669" badge={d.mode === 'demo' ? 'Démo' : null} />
                <IoTModuleCard to="/client-iot?tab=food-quality" icon="📷" title="ESP32-CAM qualité" subtitle="Détection bonne / mauvaise qualité croquettes en temps réel." status="Surveillance active" statusColor="#7c3aed" badge="Comme un frigo connecté" />
                <IoTModuleCard to="/client-smart-water" icon="💧" title="Fontaine connectée" subtitle="Hydratation, réservoir, filtres." status={`${c.waterMonitors || 0} monitoré(s)`} statusColor="#0ea5e9" />
                <IoTModuleCard to="/client-smart-delivery" icon="🚚" title="Livraison prédictive" subtitle="GPS temps réel + surveillance chaîne du froid IoT jusqu'à réception." status="Suivi actif" statusColor="#0ea5e9" badge="Capteurs véhicule" />
                <IoTModuleCard to="/client-traceability" icon="🔗" title="Traçabilité blockchain" subtitle="Origine, lots et certifications aliments." status="Vérifier un lot" statusColor="#7c3aed" />
                <IoTModuleCard to="/client-iot?tab=advanced" icon="⚖️" title="Balance connectée" subtitle="Mesure consommation quotidienne — sync jumeau numérique." status="65 g/jour" statusColor="#059669" badge="Premium" />
                <IoTModuleCard to="/client-iot?tab=advanced" icon="🧊" title="Réfrigérateur intelligent" subtitle="Conservation pâtées/frais — 4°C, péremption, porte." status="Lot OK" statusColor="#0369a1" />
                <IoTModuleCard to="/client-digital-twin" icon="🧬" title="Jumeau numérique" subtitle="Historique alimentaire, poids, activité, IA — Premium PFE." status="Score bien-être" statusColor="#7c3aed" badge="PFE" />
                <IoTModuleCard to="/premium" icon="✨" title="Fonctionnalités Premium" subtitle="IoT avancé + Smart Pet Digital Twin — vue complète PFE." status="11 modules" statusColor="#7c3aed" />
              </div>

              <section style={card}>
                <h3 style={{ margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 16 }}>
                  <Cpu size={20} color="#1e40af" /> Connecter un ESP32
                </h3>
                <ol style={{ margin: 0, paddingLeft: 20, color: '#475569', fontSize: 14, lineHeight: 1.7 }}>
                  <li>Créez un distributeur dans <Link to="/pet-feeder" style={{ color: '#2563eb', fontWeight: 700 }}>Distributeur IoT</Link></li>
                  <li>Copiez la <strong>clé appareil</strong> (device key)</li>
                  <li>Flashez le firmware <code>firmware/esp32/PetFeederESP32</code></li>
                  <li>Vérifiez le statut <Wifi size={14} style={{ verticalAlign: 'middle' }} /> En ligne</li>
                </ol>
              </section>
            </>
          )}

          {tab === 'food-quality' && (
            <div className="iot-card">
              <IoTFoodQualityCamPanel loading={loading} />
            </div>
          )}

          {tab === 'advanced' && (
            <div className="iot-card">
              <AdvancedIoTDevicesPanel />
            </div>
          )}

          {tab === 'intelligence' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
                <Stat value={d.healthScore ?? '—'} label="Score santé IoT" color="#059669" />
                <Stat value={d.intelligence?.insightCount ?? 0} label="Insights IA" color="#7c3aed" />
                <Stat value={d.intelligence?.criticalPredictions ?? 0} label="Prédictions critiques" color="#dc2626" />
                <Stat value={(d.sensorTimeline || []).length} label="Événements capteurs" color="#0ea5e9" />
              </div>
              <div className="iot-intel-grid">
                <div className="iot-card">
                  <IoTInsightsPanel
                    insights={d.insights}
                    predictions={d.predictions}
                    loading={loading}
                  />
                </div>
                <div className="iot-card">
                  <IoTSensorTimelinePanel events={d.sensorTimeline} loading={loading} />
                </div>
              </div>
            </>
          )}

          {tab === 'devices' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
              {(d.devices || []).map((device) => (
                <motion.div key={device.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                  <IoTDeviceCard device={device} />
                </motion.div>
              ))}
              {!d.devices?.length && <p style={{ color: '#64748b' }}>Aucun appareil — ajoutez un distributeur ou une fontaine.</p>}
            </div>
          )}

          {tab === 'alerts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(d.alerts || []).map((a) => (
                <div key={a.id} style={{
                  ...card, marginBottom: 0,
                  borderLeft: `4px solid ${SEV[a.severity] || '#64748b'}`,
                }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, color: SEV[a.severity], textTransform: 'uppercase' }}>
                        {a.source === 'feeder' ? '🍽️ Distributeur' : a.source === 'feeder-cam' ? '📷 ESP32-CAM' : '💧 Fontaine'} · {a.severity}
                      </p>
                      <strong style={{ fontSize: 15 }}>{a.title}</strong>
                      <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>{a.message}</p>
                    </div>
                    {a.link && (
                      <Link to={a.link} style={{ fontSize: 13, fontWeight: 700, color: '#2563eb', alignSelf: 'center' }}>
                        Résoudre →
                      </Link>
                    )}
                  </div>
                </div>
              ))}
              {!d.alerts?.length && (
                <div style={{ ...card, background: '#f0fdf4', borderColor: '#bbf7d0' }}>
                  <p style={{ margin: 0, color: '#166534', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Bell size={16} /> Aucune alerte — tous les capteurs sont dans les normes.
                  </p>
                </div>
              )}
            </div>
          )}

          {tab === 'automations' && (
            <>
              <p style={{ margin: '0 0 16px', fontSize: 14, color: '#64748b' }}>
                Règles intelligentes qui réagissent aux capteurs IoT (stock bas, hydratation, livraison).
              </p>
              <IoTAutomationRulesPanel automations={d.automations} />
              {(c.criticalAlerts || 0) > 0 && (
                <div style={{ ...card, marginTop: 16, background: '#fffbeb', borderColor: '#fde68a' }}>
                  <p style={{ margin: 0, fontSize: 13, color: '#92400e', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertTriangle size={16} /> {c.criticalAlerts} alerte(s) critique(s) — vérifiez l&apos;onglet Alertes.
                  </p>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

const Stat = ({ value, label, color }) => (
  <div className="cc-stat">
    <strong style={{ color }}>{value}</strong>
    <span>{label}</span>
  </div>
);

const btnLight = {
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 10,
  border: 'none', background: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: 700, cursor: 'pointer',
};

export default ClientIoTHubPage;
