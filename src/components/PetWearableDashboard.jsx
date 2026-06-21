import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart, Activity, Wind, Thermometer, Wifi, WifiOff, Play, Square, RefreshCw,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import useWearablePetLive from '../hooks/useWearablePetLive';
import { WEARABLE_FEATURES } from '../config/wearablePetCatalog';
import './PetWearableDashboard.css';

const VITAL_STATUS_CLASS = {
  ok: 'is-ok',
  warn: 'is-warn',
  critical: 'is-critical',
  unknown: '',
};

const formatTick = (ts) => {
  if (!ts) return '—';
  const diff = Date.now() - ts;
  if (diff < 5000) return 'À l\'instant';
  if (diff < 60000) return `Il y a ${Math.round(diff / 1000)} s`;
  return `Il y a ${Math.round(diff / 60000)} min`;
};

const VitalGauge = ({ label, value, unit, status, icon: Icon, large }) => (
  <div className={`wear-vital${large ? ' wear-vital--large' : ''} ${VITAL_STATUS_CLASS[status] || ''}`}>
    <div className="wear-vital__head">
      {Icon && <Icon size={large ? 22 : 16} />}
      <span>{label}</span>
    </div>
    <strong className="wear-vital__value">
      {value ?? '—'}
      {unit && <small>{unit}</small>}
    </strong>
  </div>
);

const PetCollarCard = ({ collar, history, pulse }) => {
  const m = collar.metrics || {};
  const vs = collar.vitalsStatus || {};
  const stateMeta = collar.stateMeta || {};
  const chartData = useMemo(
    () => (history || []).slice(-12).map((p) => ({
      t: p.label || new Date(p.at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      hr: p.heartRateBpm,
      spo2: p.spo2Percent,
    })),
    [history],
  );

  const online = collar.status === 'online';
  const hasAlert = Object.values(vs).some((s) => s === 'warn' || s === 'critical');

  return (
    <article className={`wear-collar-card${hasAlert ? ' has-alert' : ''}`}>
      <header className="wear-collar-card__header">
        <div>
          <span className="wear-collar-card__pet-icon">{collar.petType === 'cat' ? '🐱' : '🐕'}</span>
          <div>
            <h3>{collar.petName}</h3>
            <p>{collar.name}</p>
          </div>
        </div>
        <div className="wear-collar-card__status">
          {online ? <Wifi size={16} color="#059669" /> : <WifiOff size={16} color="#dc2626" />}
          <span className={`wear-state-badge${m.animalState === 'critical' ? ' is-critical' : ''}`} style={{ '--state-color': stateMeta.color }}>
            {stateMeta.icon} {stateMeta.label || m.animalState}
          </span>
        </div>
      </header>

      <div className={`wear-hr-hero${pulse ? ' is-pulsing' : ''}`}>
        <Heart size={28} className="wear-hr-hero__icon" />
        <div>
          <strong>{m.heartRateBpm ?? '—'}</strong>
          <span>bpm — fréquence cardiaque</span>
        </div>
        <div className="wear-spo2-ring" style={{ '--spo2': m.spo2Percent ?? 0 }}>
          <span>{m.spo2Percent ?? '—'}%</span>
          <small>SpO₂</small>
        </div>
      </div>

      <div className="wear-vitals-grid">
        <VitalGauge label="Respiration" value={m.respiratoryRate} unit="/min" status={vs.respiratory} icon={Wind} />
        <VitalGauge label="Température" value={m.bodyTempC} unit="°C" status={vs.bodyTemp} icon={Thermometer} />
        <VitalGauge label="Stress" value={m.stressIndex} unit="/100" status={vs.stress} icon={Activity} />
        <VitalGauge label="Pas aujourd'hui" value={m.stepsToday?.toLocaleString('fr-FR')} unit="" status="ok" icon={Activity} />
      </div>

      {chartData.length > 1 && (
        <div className="wear-chart">
          <p className="wear-chart__title">Courbe 12 h — rythme &amp; oxygène</p>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="t" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="hr" tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
              <YAxis yAxisId="spo2" orientation="right" tick={{ fontSize: 10 }} domain={[90, 100]} hide />
              <Tooltip />
              <Line yAxisId="hr" type="monotone" dataKey="hr" stroke="#dc2626" strokeWidth={2} dot={false} name="bpm" />
              <Line yAxisId="spo2" type="monotone" dataKey="spo2" stroke="#059669" strokeWidth={2} dot={false} name="SpO₂ %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <footer className="wear-collar-card__footer">
        {collar.batteryPercent != null && (
          <span>🔋 {collar.batteryPercent}%</span>
        )}
        {collar.lastSeen && <span>Sync {formatTick(new Date(collar.lastSeen).getTime())}</span>}
        {hasAlert && (
          <Link to="/veterinary" className="wear-vet-link">Consulter un vétérinaire →</Link>
        )}
      </footer>
    </article>
  );
};

const PetWearableDashboard = () => {
  const {
    state,
    loading,
    isLive,
    setIsLive,
    lastTickAt,
    socketConnected,
    reload,
  } = useWearablePetLive({ enabled: true, demoSimulate: true });

  if (loading && !state) {
    return <p className="iot-muted">Connexion colliers connectés…</p>;
  }

  const collars = state?.collars || [];
  const counts = state?.counts || {};

  return (
    <div className="wear-dashboard">
      <header className="wear-dashboard__header">
        <div>
          <h2>📿 Colliers santé connectés</h2>
          <p>
            SpO₂, rythme cardiaque, respiration et état de vos animaux en temps réel.
            {state?.mode === 'demo' && ' (mode démo — simulation live)'}
          </p>
        </div>
        <div className="wear-dashboard__actions">
          <span className={`wear-live-pill${isLive ? ' is-on' : ''}`}>
            {socketConnected || isLive ? '🟢 Live' : '⚪ Pause'}
            {lastTickAt ? ` · ${formatTick(lastTickAt)}` : ''}
          </span>
          <button type="button" className="wear-btn" onClick={() => setIsLive(!isLive)}>
            {isLive ? <><Square size={14} /> Pause</> : <><Play size={14} /> Reprendre</>}
          </button>
          <button type="button" className="wear-btn wear-btn--ghost" onClick={reload}>
            <RefreshCw size={14} /> Actualiser
          </button>
        </div>
      </header>

      <div className="wear-kpis">
        <div className="wear-kpi">
          <strong>{counts.online ?? 0}/{counts.total ?? 0}</strong>
          <span>Colliers en ligne</span>
        </div>
        <div className="wear-kpi">
          <strong>{collars.filter((c) => c.metrics?.animalState === 'active').length}</strong>
          <span>Actifs maintenant</span>
        </div>
        <div className={`wear-kpi${(state?.alerts?.length || 0) > 0 ? ' wear-kpi--warn' : ''}`}>
          <strong>{state?.alerts?.length || 0}</strong>
          <span>Alertes vitales</span>
        </div>
      </div>

      {state?.alerts?.length > 0 && (
        <div className="wear-alerts">
          {state.alerts.map((a) => (
            <div key={a.id} className={`wear-alert wear-alert--${a.severity}`}>
              <strong>{a.title}</strong>
              <span>{a.message}</span>
            </div>
          ))}
        </div>
      )}

      {collars.length === 0 ? (
        <p className="iot-muted">Aucun collier connecté. Associez un PetCollar Vital depuis l&apos;onglet Appareils.</p>
      ) : (
        <div className="wear-collar-grid">
          {collars.map((c) => (
            <PetCollarCard
              key={c.id}
              collar={c}
              history={state.history?.[c.id]}
              pulse={isLive && c.status === 'online'}
            />
          ))}
        </div>
      )}

      <section className="wear-features">
        <h3>Capteurs intégrés</h3>
        <div className="wear-features-grid">
          {WEARABLE_FEATURES.map((f) => (
            <div key={f.id} className="wear-feature-chip">
              <span>{f.icon}</span>
              <div>
                <strong>{f.label}</strong>
                <small>{f.desc}</small>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default PetWearableDashboard;
