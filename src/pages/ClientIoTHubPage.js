import React, { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Wifi, AlertTriangle, ChevronRight, Cpu, RefreshCw, Activity,
  Calendar, Bell,
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { fetchIoTPack } from '../services/iotService';
import IoTInsightsPanel from '../components/IoTInsightsPanel';
import IoTSensorTimelinePanel from '../components/IoTSensorTimelinePanel';
import IoTAutomationRulesPanel from '../components/IoTAutomationRulesPanel';
import IoTFoodQualityCamPanel from '../components/IoTFoodQualityCamPanel';
import AdvancedIoTDevicesPanel from '../components/AdvancedIoTDevicesPanel';
import IoTLiveStatusBar from '../components/IoTLiveStatusBar';
import IoTAnomalyPanel from '../components/IoTAnomalyPanel';
import IoTMobileBridgePanel from '../components/IoTMobileBridgePanel';
import FoodDistributionPanel from '../components/FoodDistributionPanel';
import IoTCommandCenter from '../components/IoTCommandCenter';
import IoTDevicesRegistryPanel from '../components/IoTDevicesRegistryPanel';
import IoTNetworkTopologyPanel from '../components/IoTNetworkTopologyPanel';
import IoTEnvironmentPanel from '../components/IoTEnvironmentPanel';
import IoTSecurityPanel from '../components/IoTSecurityPanel';
import DemoModePill from '../components/DemoModePill';
import usePlatformRefresh from '../hooks/usePlatformRefresh';
import useIoTLive from '../hooks/useIoTLive';
import useIsMobile from '../hooks/useIsMobile';
import { DEMO_ADVANCED_IOT_DEVICES } from '../config/advancedIotPremiumCatalog';
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
  { id: 'distribution', label: 'Distribution nourriture', shortLabel: 'Distrib.' },
  { id: 'devices', label: 'Appareils', shortLabel: 'Appareils' },
  { id: 'detection', label: 'ESP32-CAM & afficheur', shortLabel: 'Caméra' },
  { id: 'environment', label: 'Environnement', shortLabel: 'Env.' },
  { id: 'security', label: 'Sécurité', shortLabel: 'Sécu.' },
  { id: 'advanced', label: 'IoT avancé', shortLabel: 'Avancé' },
  { id: 'intelligence', label: 'Intelligence IA', shortLabel: 'IA' },
  { id: 'alerts', label: 'Alertes', shortLabel: 'Alertes' },
  { id: 'automations', label: 'Automatisations', shortLabel: 'Auto' },
];

const SEV = { high: '#dc2626', medium: '#d97706', low: '#64748b' };

const IoTModuleCard = ({ to, icon, title, subtitle, status, statusColor, badge }) => (
  <Link to={to} style={{ ...card, display: 'block', textDecoration: 'none', color: 'inherit' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
      <div>
        <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
        <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 800 }}>{title}</h3>
        <p style={{ margin: 0, fontSize: 13, color: '#64748b', lineHeight: 1.45 }}>{subtitle}</p>
        {badge && (
          <span style={{
            display: 'inline-block', marginTop: 10, fontSize: 11, fontWeight: 700,
            color: '#7c3aed', background: '#f5f3ff', padding: '4px 10px', borderRadius: 999,
          }}
          >
            {badge}
          </span>
        )}
      </div>
      <ChevronRight size={20} color="#94a3b8" />
    </div>
    {status && (
      <p style={{ margin: '14px 0 0', fontSize: 13, fontWeight: 700, color: statusColor || '#475569' }}>{status}</p>
    )}
  </Link>
);

const ClientIoTHubPage = () => {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState('distribution');
  const [pack, setPack] = useState(null);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

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
    if (t === 'food-quality') setTab('detection');
    else if (t === 'security') setTab('security');
    else if (t && TABS.some((x) => x.id === t)) setTab(t);
  }, [searchParams]);

  const live = useIoTLive({ enabled: true });

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
      <header className="cc-hero iot-hub-hero" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #059669 100%)',
        color: 'white', borderRadius: 20, marginBottom: 24,
      }}
      >
        <div className="iot-hub-hero__inner">
          <div className="iot-hub-hero__copy">
            <h1>📡 Centre IoT PetfoodTN</h1>
            <p>
              Distributeur ESP32 · ESP32-CAM (détection nourriture + OLED) · fontaines connectées,
              environnement, registre appareils et commandes à distance.
            </p>
            {!loading && d.healthScore != null && (
              <div className="iot-hub-hero__scores">
                <span className="iot-hub-hero__score">
                  <strong>{d.healthScore}</strong> Santé IoT
                </span>
                {d.networkHealth?.score != null && (
                  <span className="iot-hub-hero__score">
                    <strong>{d.networkHealth.score}</strong> Réseau
                  </span>
                )}
                {d.security?.overallScore != null && (
                  <span className="iot-hub-hero__score">
                    <strong>{d.security.overallScore}</strong> Sécurité
                  </span>
                )}
                <span className="iot-hub-hero__score">
                  <strong>{c.feedersOnline + (c.feederCamsOnline ?? 0) + (c.waterOnline || 0)}</strong> En ligne
                </span>
              </div>
            )}
          </div>
          <div className="iot-hub-hero__actions">
            {d.mode === 'demo' && <DemoModePill />}
            <button type="button" onClick={load} disabled={loading} className="iot-hub-hero__refresh" style={btnLight}>
              <RefreshCw size={16} /> {isMobile ? '' : 'Actualiser'}
            </button>
          </div>
        </div>
      </header>

      <IoTLiveStatusBar
        socketConnected={live.socketConnected}
        mqttConnected={live.mqttConnected || d.mqtt?.connected}
        lastEventAt={live.lastEventAt}
        mode={d.mode}
      />

      <div className="iot-tabs" role="tablist" aria-label="Sections IoT">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`iot-tab${tab === t.id ? ' is-active' : ''}`}
          >
            {isMobile ? t.shortLabel : t.label}
            {t.id === 'security' && (d.security?.threats?.length || 0) > 0 && (
              <span className="iot-tab-badge">{d.security.threats.length}</span>
            )}
            {t.id === 'devices' && (d.devices?.length || 0) > 0 && (
              <span className="iot-tab-badge">{d.devices.length}</span>
            )}
            {t.id === 'alerts' && (c.alerts > 0 || (d.anomalies?.length || 0) > 0) && (
              <span className="iot-tab-badge">{Math.max(c.alerts || 0, d.anomalies?.length || 0)}</span>
            )}
            {t.id === 'intelligence' && (d.intelligence?.insightCount || 0) > 0 && (
              <span className="iot-tab-badge">{d.intelligence.insightCount}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#94a3b8', padding: 32 }}>Synchronisation…</p>
      ) : (
        <>
          {tab === 'distribution' && (
            <>
              <IoTCommandCenter pack={d} onRefresh={load} />

              <FoodDistributionPanel pack={d} demoMode={d.mode === 'demo'} />

              <div className="iot-stats-grid">
                <Stat value={`${c.feedersOnline || 0}/${c.feeders || 0}`} label="Distributeurs" color="#059669" />
                <Stat value={`${c.feederCamsOnline ?? 1}/${c.feederCams ?? 1}`} label="ESP32-CAM" color="#7c3aed" />
                <Stat value={`${c.waterOnline || 0}/${c.waterMonitors || 0}`} label="Fontaines" color="#0ea5e9" />
                <Stat value={c.alerts || 0} label="Alertes actives" color="#f59e0b" />
                {d.consumptionForecast?.daysUntilEmpty != null && (
                  <Stat
                    value={`${d.consumptionForecast.daysUntilEmpty}j`}
                    label="Stock estimé"
                    color={d.consumptionForecast.urgency === 'high' ? '#dc2626' : '#059669'}
                  />
                )}
              </div>

              <div className="iot-mobile-bridge-wrap">
                <IoTMobileBridgePanel
                  mobilePush={d.mobilePush || DEMO_ADVANCED_IOT_DEVICES.mobilePush}
                  alertCount={c.alerts || 0}
                  healthScore={d.healthScore || 0}
                  devicesOnline={(c.feedersOnline || 0) + (c.waterOnline || 0) + (c.feederCamsOnline || 0)}
                  devicesTotal={(c.feeders || 0) + (c.waterMonitors || 0) + (c.feederCams || 0)}
                />
              </div>

              {feederChart.length > 0 && (
                <div className="iot-charts-grid">
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
                      <Activity size={16} color="#0ea5e9" /> Consommation eau — 7 jours (ml)
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
                <div style={{ ...card, marginBottom: 20 }} className="iot-routines-card">
                  <h3 style={{ margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 15 }}>
                    <Calendar size={18} color="#7c3aed" /> Routines du jour
                  </h3>
                  <div className="iot-routines-list">
                    {d.routines.slice(0, 6).map((r, i) => (
                      <div key={i} className="iot-routine-row">
                        <span style={{ fontWeight: 800, fontSize: 13, color: '#1e40af', minWidth: 48 }}>{r.time}</span>
                        <span style={{ flex: 1, fontSize: 13 }}>{r.label}</span>
                        <span style={{ fontSize: 12, color: '#64748b' }}>{r.action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="iot-modules-grid">
                <IoTModuleCard
                  to="/pet-feeder"
                  icon="🍽️"
                  title="Distributeur ESP32"
                  subtitle="Portions automatiques, capteurs niveau et balance."
                  status={`${c.feedersOnline || 0} en ligne`}
                  statusColor="#059669"
                  badge={d.mode === 'demo' ? 'Démo' : null}
                />
                <IoTModuleCard
                  to="/client-iot?tab=detection"
                  icon="📷"
                  title="ESP32-CAM & afficheur"
                  subtitle="Détection nourriture réelle → affichage OLED local."
                  status="Surveillance active"
                  statusColor="#7c3aed"
                />
                <IoTModuleCard
                  to="/client-smart-water"
                  icon="💧"
                  title="Consommation eau"
                  subtitle="Fontaine connectée, hydratation et réservoir."
                  status={`${c.waterMonitors || 0} monitoré(s)`}
                  statusColor="#0ea5e9"
                />
                <IoTModuleCard
                  to="/client-traceability"
                  icon="🔗"
                  title="Traçabilité"
                  subtitle="Origine, lots et certifications aliments."
                  status="Vérifier un lot"
                  statusColor="#7c3aed"
                />
                <IoTModuleCard
                  to="/mobile#iot"
                  icon="📱"
                  title="Application mobile"
                  subtitle="Push IoT, alertes, eau et traçabilité synchronisés."
                  status="Sync web ↔ mobile"
                  statusColor="#059669"
                  badge="Android & iOS"
                />
                <IoTModuleCard
                  to="/client-iot?tab=advanced"
                  icon="⚡"
                  title="IoT avancé"
                  subtitle="Balances, capteurs premium et appareils connectés."
                  status="Voir modules"
                  statusColor="#0369a1"
                />
              </div>

              <section style={{ marginBottom: 20 }}>
                <IoTNetworkTopologyPanel networkHealth={d.networkHealth} mqtt={d.mqtt} />
              </section>

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

          {tab === 'devices' && (
            <IoTDevicesRegistryPanel devices={d.devices || []} demoMode={d.mode === 'demo'} />
          )}

          {tab === 'detection' && (
            <div className="iot-card">
              <IoTFoodQualityCamPanel loading={loading} />
            </div>
          )}

          {tab === 'environment' && (
            <>
              <IoTEnvironmentPanel environment={d.environment} telemetry={d.telemetry} />
              <div style={{ marginTop: 16 }}>
                <IoTNetworkTopologyPanel networkHealth={d.networkHealth} mqtt={d.mqtt} />
              </div>
            </>
          )}

          {tab === 'security' && (
            <div className="iot-card">
              <IoTSecurityPanel />
            </div>
          )}

          {tab === 'advanced' && (
            <div className="iot-card">
              <AdvancedIoTDevicesPanel />
            </div>
          )}

          {tab === 'intelligence' && (
            <>
              <div className="iot-stats-grid">
                <Stat value={d.healthScore ?? '—'} label="Score santé IoT" color="#059669" />
                <Stat value={d.intelligence?.insightCount ?? 0} label="Insights IA" color="#7c3aed" />
                <Stat value={d.intelligence?.criticalPredictions ?? 0} label="Prédictions critiques" color="#dc2626" />
                <Stat value={(d.sensorTimeline || []).length} label="Événements capteurs" color="#0ea5e9" />
              </div>
              <div style={{ marginBottom: 16 }}>
                <IoTAnomalyPanel anomalies={d.anomalies} loading={loading} />
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

          {tab === 'alerts' && (
            <>
              <div style={{ marginBottom: 16 }}>
                <IoTAnomalyPanel anomalies={d.anomalies} loading={loading} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(d.alerts || []).map((a) => (
                  <div
                    key={a.id}
                    style={{
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
            </>
          )}

          {tab === 'automations' && (
            <>
              <p style={{ margin: '0 0 16px', fontSize: 14, color: '#64748b' }}>
                Règles intelligentes : stock bas, hydratation, qualité nourriture — synchronisées avec l&apos;app mobile.
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
