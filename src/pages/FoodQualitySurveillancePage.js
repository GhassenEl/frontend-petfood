import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Thermometer, Droplets, Sun, Wind, RefreshCw, AlertTriangle,
  Package, Brain, Snowflake, Truck, Warehouse,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import { fetchColdChainSurveillance } from '../services/coldChainQualityService';
import DeliveryColdChainPanel from '../components/DeliveryColdChainPanel';
import { ZONE_TYPES } from '../utils/coldChainQualityEngine';
import DemoModePill from '../components/DemoModePill';
import './FoodQualitySurveillance.css';

const TABS = [
  { id: 'live', label: 'Temps réel' },
  { id: 'delivery', label: 'Livraison 🚚' },
  { id: 'anomalies', label: 'Anomalies IA' },
  { id: 'batches', label: 'Lots & scores' },
  { id: 'fridge', label: 'Frigo connecté' },
  { id: 'predictions', label: 'Conservation' },
];

const SEV = { high: '#dc2626', medium: '#d97706', low: '#64748b' };
const BATCH_STATUS = {
  good: { label: 'Excellent', color: '#059669' },
  acceptable: { label: 'Bon', color: '#0ea5e9' },
  warning: { label: 'À surveiller', color: '#d97706' },
  critical: { label: 'Critique', color: '#dc2626' },
};
const PRIORITY = {
  urgent: { label: 'Urgent', color: '#dc2626' },
  high: { label: 'Prioritaire', color: '#d97706' },
  normal: { label: 'Normal', color: '#059669' },
};

const ZoneIcon = ({ type }) => {
  if (type === 'vehicle') return <Truck size={18} />;
  if (type === 'fridge') return <Snowflake size={18} />;
  if (type === 'feeder') return <Package size={18} />;
  return <Warehouse size={18} />;
};

const FoodQualitySurveillancePage = ({ role = 'admin' }) => {
  const [tab, setTab] = useState('live');
  const [pack, setPack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedZoneId, setSelectedZoneId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchColdChainSurveillance(role);
      setPack(data);
      setSelectedZoneId((prev) => prev || data.zones?.[0]?.id || null);
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => { load(); }, [load]);

  const d = pack || {};
  const c = d.counts || {};
  const selectedZone = d.zones?.find((z) => z.id === selectedZoneId) || d.zones?.[0];
  const fridgeZones = (d.zones || []).filter((z) => z.type === 'fridge' || z.type === 'warehouse');

  const basePath = role === 'vendor' ? '/vendor' : '/admin';

  return (
    <div className="fqs-page">
      <header className="fqs-hero">
        <div className="fqs-hero-inner">
          <div>
            <h1>🌡️ Surveillance intelligente qualité alimentaire</h1>
            <p>
              Capteurs IoT (entrepôts, véhicules, distributeurs, réfrigérateurs) — température, humidité,
              luminosité, qualité de l&apos;air. Détection IA des anomalies et score par lot.
            </p>
          </div>
          <div className="fqs-hero-actions">
            {d.mode === 'demo' && <DemoModePill />}
            <div className="fqs-score-ring">
              <strong>{c.avgQualityScore ?? '—'}</strong>
              <span>Score moyen</span>
            </div>
            <button type="button" className="fqs-btn fqs-btn--light" onClick={load} disabled={loading}>
              <RefreshCw size={16} /> Actualiser
            </button>
          </div>
        </div>
      </header>

      <div className="fqs-stats">
        <Stat value={`${c.zonesOnline ?? 0}/${c.zones ?? 0}`} label="Zones IoT en ligne" color="#059669" />
        <Stat value={c.activeAlerts ?? 0} label="Alertes actives" color="#dc2626" />
        <Stat value={c.batches ?? 0} label="Lots suivis" color="#1e40af" />
        <Stat value={c.urgentLots ?? 0} label="Lots prioritaires" color="#d97706" />
      </div>

      <div className="fqs-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`fqs-tab${tab === t.id ? ' is-active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
            {t.id === 'anomalies' && c.activeAlerts > 0 && (
              <span className="fqs-tab-badge">{c.activeAlerts}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="fqs-muted">Synchronisation capteurs chaîne du froid…</p>
      ) : (
        <>
          {tab === 'live' && (
            <>
              <p className="fqs-ai-banner">
                <Brain size={16} /> {d.intelligence?.summary}
              </p>
              <div className="fqs-zone-grid">
                {(d.zones || []).map((zone) => {
                  const meta = ZONE_TYPES[zone.type] || ZONE_TYPES.warehouse;
                  const r = zone.currentReading || {};
                  return (
                    <button
                      key={zone.id}
                      type="button"
                      className={`fqs-zone-card${selectedZoneId === zone.id ? ' is-selected' : ''}`}
                      onClick={() => setSelectedZoneId(zone.id)}
                    >
                      <div className="fqs-zone-head">
                        <span style={{ color: meta.color }}><ZoneIcon type={zone.type} /></span>
                        <div>
                          <strong>{zone.name}</strong>
                          <span>{meta.label} · {zone.location}</span>
                        </div>
                        <span className={`fqs-pill fqs-pill--${zone.status === 'online' ? 'ok' : 'off'}`}>
                          {zone.status === 'online' ? 'En ligne' : 'Hors ligne'}
                        </span>
                      </div>
                      <div className="fqs-sensors">
                        <SensorChip icon={<Thermometer size={14} />} label="Temp." value={`${r.temperatureC} °C`} warn={r.temperatureC > 22 && zone.type !== 'vehicle'} />
                        <SensorChip icon={<Droplets size={14} />} label="HR" value={`${r.humidityPct} %`} warn={r.humidityPct > 60} />
                        <SensorChip icon={<Sun size={14} />} label="Lumière" value={`${r.luminosityLux} lx`} />
                        <SensorChip icon={<Wind size={14} />} label="Air" value={`${r.airQualityPpm} ppm`} />
                      </div>
                      <div className="fqs-zone-score">
                        Score zone <strong style={{ color: zone.conditionScore >= 75 ? '#059669' : '#d97706' }}>{zone.conditionScore}/100</strong>
                        {zone.anomalies?.length > 0 && (
                          <span className="fqs-zone-alert"><AlertTriangle size={12} /> {zone.anomalies.length}</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedZone && (
                <div className="fqs-card">
                  <h3>Historique — {selectedZone.name}</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={selectedZone.historySeries || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="t" tick={{ fontSize: 10 }} />
                      <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="temp" name="Temp °C" stroke="#ef4444" strokeWidth={2} dot={false} />
                      <Line yAxisId="left" type="monotone" dataKey="humidity" name="HR %" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                      <Line yAxisId="right" type="monotone" dataKey="lux" name="Lux" stroke="#eab308" strokeWidth={1.5} dot={false} />
                      <Line yAxisId="right" type="monotone" dataKey="air" name="Air ppm" stroke="#8b5cf6" strokeWidth={1.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          )}

          {tab === 'delivery' && (
            <DeliveryColdChainPanel
              role={role === 'vendor' ? 'vendor' : 'admin'}
              title="Surveillance pendant la livraison"
            />
          )}

          {tab === 'anomalies' && (
            <div className="fqs-anomaly-list">
              {(d.anomalies || []).length === 0 ? (
                <div className="fqs-card fqs-card--ok">
                  <p>✅ Aucune anomalie — conditions de conservation optimales.</p>
                </div>
              ) : (
                d.anomalies.map((a) => (
                  <div key={a.id} className="fqs-anomaly" style={{ borderLeftColor: SEV[a.severity] }}>
                    <span className="fqs-anomaly-icon">{a.icon}</span>
                    <div>
                      <p className="fqs-anomaly-sev" style={{ color: SEV[a.severity] }}>{a.severity} · {a.type}</p>
                      <strong>{a.title}</strong>
                      <p>{a.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'batches' && (
            <div className="fqs-card">
              <h3><Package size={18} /> État des lots alimentaires</h3>
              <div className="fqs-table-wrap">
                <table className="fqs-table">
                  <thead>
                    <tr>
                      <th>Lot</th>
                      <th>Produit</th>
                      <th>Zone</th>
                      <th>Score IA</th>
                      <th>Expiration</th>
                      <th>Qté</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(d.batches || []).map((b) => {
                      const st = BATCH_STATUS[b.qualityStatus] || BATCH_STATUS.acceptable;
                      const zone = d.zones?.find((z) => z.id === b.zoneId);
                      return (
                        <tr key={b.id}>
                          <td><code>{b.code}</code></td>
                          <td>{b.productName}</td>
                          <td>{zone?.name || '—'}</td>
                          <td><span style={{ color: st.color, fontWeight: 700 }}>{b.qualityScore}/100 · {st.label}</span></td>
                          <td>{b.expiryDate}</td>
                          <td>{b.quantity}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'fridge' && (
            <div className="fqs-fridge-grid">
              {fridgeZones.map((zone) => {
                const r = zone.currentReading || {};
                return (
                  <div key={zone.id} className="fqs-card fqs-fridge-card">
                    <h3><Snowflake size={18} /> {zone.name}</h3>
                    <p className="fqs-fridge-loc">{zone.location}</p>
                    <ul className="fqs-fridge-features">
                      <li>✅ Température cible : <strong>{zone.targetTempC} °C</strong> (actuelle {r.temperatureC} °C)</li>
                      <li>{zone.autoControl ? '✅' : '⚠️'} Contrôle automatique {zone.autoControl ? 'actif' : 'manuel'}</li>
                      <li>{r.coolingActive ? '✅' : '🚫'} Refroidissement {r.coolingActive ? 'OK' : 'PANNE'}</li>
                      <li>{!r.lidOpen ? '✅' : '⚠️'} Porte / couvercle {r.lidOpen ? 'OUVERT' : 'fermé'}</li>
                      <li>📱 Alertes temps réel vers l&apos;application mobile</li>
                    </ul>
                    <p className="fqs-fridge-hist">Historique conservation disponible dans l&apos;onglet Temps réel.</p>
                  </div>
                );
              })}
              {role === 'client' && (
                <Link to="/client-iot?tab=food-quality" className="fqs-card fqs-link-card">
                  📷 Voir aussi ESP32-CAM — bac croquettes client
                </Link>
              )}
            </div>
          )}

          {tab === 'predictions' && (
            <>
              <p className="fqs-ai-banner">
                <Brain size={16} /> L&apos;IA estime la durée de conservation restante et identifie les lots à écouler en priorité.
              </p>
              <div className="fqs-priority-grid">
                {(d.priorityLots || []).map((b) => {
                  const pr = PRIORITY[b.prediction?.priority] || PRIORITY.normal;
                  return (
                    <div key={b.id} className="fqs-priority-card">
                      <div className="fqs-priority-head">
                        <code>{b.code}</code>
                        <span style={{ color: pr.color, fontWeight: 800 }}>{pr.label}</span>
                      </div>
                      <strong>{b.productName}</strong>
                      <p>{b.prediction?.aiSummary}</p>
                      <div className="fqs-priority-meta">
                        <span>~{b.prediction?.remainingDays} j restants</span>
                        <span>Score {b.qualityScore}/100</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {role === 'admin' && (
            <p className="fqs-footer-link">
              <Link to={`${basePath}/stock`}>Stock avancé →</Link>
              {' · '}
              <Link to="/client-iot">Hub IoT client →</Link>
            </p>
          )}
        </>
      )}
    </div>
  );
};

const Stat = ({ value, label, color }) => (
  <div className="fqs-stat">
    <strong style={{ color }}>{value}</strong>
    <span>{label}</span>
  </div>
);

const SensorChip = ({ icon, label, value, warn }) => (
  <span className={`fqs-sensor-chip${warn ? ' is-warn' : ''}`}>
    {icon} {label} {value}
  </span>
);

export default FoodQualitySurveillancePage;
