import React, { useCallback, useEffect, useState } from 'react';
import {
  Thermometer, Droplets, Sun, Wind, Truck, RefreshCw, AlertTriangle,
  Package, Brain, MapPin, CheckCircle2,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import { fetchDeliveryColdChainSurveillance } from '../services/deliveryColdChainService';
import { DELIVERY_STAGES } from '../utils/deliveryColdChainEngine';
import { formatTimeFr } from '../utils/foodQualityEngine';
import './DeliveryColdChain.css';

const SEV = { high: '#dc2626', medium: '#d97706', low: '#64748b' };

const DeliveryColdChainPanel = ({
  role = 'client',
  orderId = null,
  compact = false,
  title = 'Surveillance chaîne du froid — livraison',
}) => {
  const [pack, setPack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchDeliveryColdChainSurveillance(role, orderId);
      setPack(data);
      setSelectedId((prev) => prev || data.deliveries?.[0]?.id || null);
    } finally {
      setLoading(false);
    }
  }, [role, orderId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (role !== 'client' && role !== 'livreur') return undefined;
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, [load, role]);

  if (loading && !pack) {
    return <p className="dcc-muted">Connexion capteurs véhicule…</p>;
  }

  const deliveries = pack?.deliveries || [];
  const delivery = deliveries.find((d) => d.id === selectedId) || deliveries[0];
  const c = pack?.counts || {};

  if (!delivery && !compact) {
    return (
      <div className="dcc-empty">
        <Truck size={32} />
        <p>Aucune livraison sous surveillance IoT pour le moment.</p>
      </div>
    );
  }

  const chartData = (delivery?.sensorHistory || []).map((r) => ({
    t: new Date(r.recordedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    temp: r.temperatureC,
    humidity: r.humidityPct,
  }));

  const chainColor = (delivery?.chainScore ?? 0) >= 85 ? '#059669' : (delivery?.chainScore ?? 0) >= 65 ? '#d97706' : '#dc2626';

  return (
    <div className={`dcc-panel${compact ? ' dcc-panel--compact' : ''}`}>
      {!compact && (
        <div className="dcc-header">
          <div>
            <h2><Truck size={22} /> {title}</h2>
            <p>Capteurs IoT en temps réel — entrepôt → véhicule → réception client.</p>
          </div>
          <div className="dcc-header-actions">
            {pack?.mode === 'demo' && <span className="dcc-demo-pill">Simulation IoT</span>}
            <button type="button" className="dcc-btn" onClick={load} disabled={loading}>
              <RefreshCw size={14} /> Actualiser
            </button>
          </div>
        </div>
      )}

      {!compact && deliveries.length > 1 && (
        <div className="dcc-delivery-tabs">
          {deliveries.map((d) => (
            <button
              key={d.id}
              type="button"
              className={`dcc-delivery-tab${d.id === delivery?.id ? ' is-active' : ''}`}
              onClick={() => setSelectedId(d.id)}
            >
              {d.orderRef} · {d.vehicleName}
              {d.anomalies?.length > 0 && <span className="dcc-alert-dot" />}
            </button>
          ))}
        </div>
      )}

      {!compact && (
        <div className="dcc-stats">
          <div className="dcc-stat"><strong>{c.inTransit ?? 0}</strong><span>En transit</span></div>
          <div className="dcc-stat"><strong>{c.vehiclesOnline ?? 0}</strong><span>Véhicules IoT</span></div>
          <div className="dcc-stat"><strong style={{ color: chainColor }}>{c.avgChainScore ?? '—'}</strong><span>Score chaîne</span></div>
          <div className="dcc-stat"><strong style={{ color: '#dc2626' }}>{c.chainAlerts ?? 0}</strong><span>Alertes</span></div>
        </div>
      )}

      {delivery && (
        <>
          <div className="dcc-chain-banner">
            <div className="dcc-chain-score" style={{ borderColor: chainColor }}>
              <strong style={{ color: chainColor }}>{delivery.chainScore}</strong>
              <span>Chaîne du froid</span>
            </div>
            <div className="dcc-chain-text">
              <p className="dcc-ai"><Brain size={14} /> {delivery.aiSummary}</p>
              {delivery.etaMinutes > 0 && (
                <p className="dcc-eta">
                  <MapPin size={14} /> ETA {delivery.etaMinutes} min · {delivery.distanceKmRemaining} km · {delivery.progressPercent} %
                </p>
              )}
            </div>
          </div>

          <div className="dcc-journey">
            {Object.entries(DELIVERY_STAGES).map(([key, meta]) => {
              const ms = delivery.milestones?.find((m) => m.key === key);
              const status = ms?.status || (delivery.stage === key ? 'active' : 'pending');
              return (
                <div key={key} className={`dcc-step dcc-step--${status}`}>
                  <span className="dcc-step-icon">{meta.icon}</span>
                  <span className="dcc-step-label">{meta.label}</span>
                  {ms?.at && <span className="dcc-step-time">{formatTimeFr(ms.at)}</span>}
                </div>
              );
            })}
          </div>

          <div className="dcc-vehicle">
            <strong>{delivery.vehicleName}</strong>
            <span>{delivery.livreurName} · {delivery.warehouseName} → {delivery.address}</span>
          </div>

          <div className="dcc-sensors">
            <Sensor icon={<Thermometer size={14} />} label="Température" value={`${delivery.currentReading?.temperatureC} °C`} warn={delivery.currentReading?.temperatureC > 20} />
            <Sensor icon={<Droplets size={14} />} label="Humidité" value={`${delivery.currentReading?.humidityPct} %`} warn={delivery.currentReading?.humidityPct > 55} />
            <Sensor icon={<Sun size={14} />} label="Luminosité" value={`${delivery.currentReading?.luminosityLux} lx`} />
            <Sensor icon={<Wind size={14} />} label="Qualité air" value={`${delivery.currentReading?.airQualityPpm} ppm`} />
            <Sensor
              icon={<Truck size={14} />}
              label="Refroidissement"
              value={delivery.currentReading?.coolingActive ? 'Actif' : 'PANNE'}
              warn={!delivery.currentReading?.coolingActive}
            />
          </div>

          {(delivery.anomalies || []).length > 0 && (
            <div className="dcc-anomalies">
              {delivery.anomalies.map((a) => (
                <div key={a.id} className="dcc-anomaly" style={{ borderLeftColor: SEV[a.severity] }}>
                  <AlertTriangle size={16} color={SEV[a.severity]} />
                  <div>
                    <strong>{a.title}</strong>
                    <p>{a.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {chartData.length > 1 && (
            <div className="dcc-chart-wrap">
              <h4>Historique capteurs en transit</h4>
              <ResponsiveContainer width="100%" height={compact ? 140 : 180}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="t" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="temp" name="Temp °C" stroke="#ef4444" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="humidity" name="HR %" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {(delivery.conservation?.batches || []).length > 0 && (
            <div className="dcc-lots">
              <h4><Package size={16} /> Lots surveillés & conservation prédite</h4>
              <p className="dcc-lots-hint">{delivery.conservation.summary}</p>
              <ul>
                {delivery.conservation.batches.map((b) => (
                  <li key={b.id}>
                    <code>{b.code}</code> — {b.productName}
                    <span>Score {b.qualityScore}/100 · ~{b.prediction?.remainingDays} j</span>
                    {b.prediction?.priority !== 'normal' && (
                      <em style={{ color: b.prediction?.priority === 'urgent' ? '#dc2626' : '#d97706' }}>
                        {b.prediction?.priority === 'urgent' ? ' Urgent' : ' Prioritaire'}
                      </em>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {delivery.stage === 'delivered' && (
            <p className="dcc-delivered"><CheckCircle2 size={16} /> Réception validée — chaîne du froid respectée jusqu&apos;au client.</p>
          )}
        </>
      )}
    </div>
  );
};

const Sensor = ({ icon, label, value, warn }) => (
  <div className={`dcc-sensor${warn ? ' is-warn' : ''}`}>
    {icon}
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
);

export default DeliveryColdChainPanel;
