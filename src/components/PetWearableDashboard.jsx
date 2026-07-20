import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart, Activity, Wind, Thermometer, Wifi, WifiOff, Play, Square, RefreshCw,
  Moon, MapPin, Target, Stethoscope, ChevronDown, ChevronUp, Share2,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ComposedChart, Area,
} from 'recharts';
import useWearablePetLive from '../hooks/useWearablePetLive';
import { WEARABLE_FEATURES, ACTIVITY_LEVELS } from '../config/wearablePetCatalog';
import './PetWearableDashboard.css';

const VITAL_STATUS_CLASS = {
  ok: 'is-ok',
  warn: 'is-warn',
  critical: 'is-critical',
  unknown: '',
};

const WELLNESS_COLOR = (s) => (s >= 80 ? '#059669' : s >= 60 ? '#d97706' : '#dc2626');

const formatTick = (ts) => {
  if (!ts) return '—';
  const diff = Date.now() - ts;
  if (diff < 5000) return 'À l\'instant';
  if (diff < 60000) return `Il y a ${Math.round(diff / 1000)} s`;
  return `Il y a ${Math.round(diff / 60000)} min`;
};

const PulseWave = ({ active }) => (
  <div className={`wear-pulse-wave${active ? ' is-live' : ''}`} aria-hidden="true">
    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
      <span key={i} className="wear-pulse-wave__bar" style={{ '--i': i }} />
    ))}
  </div>
);

const WellnessRing = ({ score, size = 64 }) => {
  const color = WELLNESS_COLOR(score ?? 0);
  return (
    <div
      className="wear-wellness-ring"
      style={{ '--score': score ?? 0, '--ring-color': color, width: size, height: size }}
      title={`Score bien-être ${score}/100`}
    >
      <span><strong>{score ?? '—'}</strong><small>/100</small></span>
    </div>
  );
};

const VitalGauge = ({ label, value, unit, status, icon: Icon, range }) => (
  <div className={`wear-vital ${VITAL_STATUS_CLASS[status] || ''}`}>
    <div className="wear-vital__head">
      {Icon && <Icon size={16} />}
      <span>{label}</span>
    </div>
    <strong className="wear-vital__value">
      {value ?? '—'}
      {unit && <small>{unit}</small>}
    </strong>
    {range && <small className="wear-vital__range">Norme : {range}</small>}
  </div>
);

const ActivityTimeline = ({ timeline = [] }) => (
  <div className="wear-activity-timeline">
    <div className="wear-activity-timeline__bars">
      {timeline.map((p) => (
        <div
          key={p.label}
          className={`wear-activity-timeline__bar wear-activity-timeline__bar--${p.level}`}
          style={{ height: `${p.intensity}%` }}
          title={`${p.label} — ${ACTIVITY_LEVELS[p.level]?.label || p.level}`}
        />
      ))}
    </div>
    <div className="wear-activity-timeline__labels">
      {timeline.filter((_, i) => i % 4 === 0).map((p) => (
        <span key={p.label}>{p.label}</span>
      ))}
    </div>
    <div className="wear-activity-timeline__legend">
      {Object.entries(ACTIVITY_LEVELS).map(([k, v]) => (
        <span key={k}><i style={{ background: v.color }} /> {v.label}</span>
      ))}
    </div>
  </div>
);

const PetCollarCard = ({
  collar, history, pulse, expanded, onToggle,
}) => {
  const m = collar.metrics || {};
  const vs = collar.vitalsStatus || {};
  const stateMeta = collar.stateMeta || {};
  const ranges = collar.vitalRanges || {};
  const goal = collar.activityGoal || {};
  const sleep = collar.sleep || {};
  const stepPct = goal.steps ? Math.min(100, Math.round(((m.stepsToday ?? 0) / goal.steps) * 100)) : 0;

  const chartData = useMemo(
    () => (history || []).slice(-12).map((p) => ({
      t: p.label || new Date(p.at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      hr: p.heartRateBpm,
      spo2: p.spo2Percent,
    })),
    [history],
  );

  const weeklyData = collar.weeklyTrend || [];
  const online = collar.status === 'online';
  const hasAlert = Object.values(vs).some((s) => s === 'warn' || s === 'critical');

  return (
    <article className={`wear-collar-card${hasAlert ? ' has-alert' : ''}${expanded ? ' is-expanded' : ''}`}>
      <button type="button" className="wear-collar-card__toggle" onClick={onToggle}>
        <header className="wear-collar-card__header">
          <div>
            <span className="wear-collar-card__pet-icon">{collar.petType === 'cat' ? '🐱' : '🐕'}</span>
            <div>
              <h3>{collar.petName}</h3>
              <p>{collar.name}</p>
            </div>
          </div>
          <div className="wear-collar-card__status">
            <WellnessRing score={collar.wellnessScore} size={52} />
            {online ? <Wifi size={16} color="#059669" /> : <WifiOff size={16} color="#dc2626" />}
            <span
              className={`wear-state-badge${m.animalState === 'critical' ? ' is-critical' : ''}`}
              style={{ '--state-color': stateMeta.color }}
            >
              {stateMeta.icon} {stateMeta.label || m.animalState}
            </span>
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </header>
      </button>

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

      <PulseWave active={pulse} />

      <div className="wear-vitals-grid">
        <VitalGauge label="Température" value={m.bodyTempC ?? m.temperatureC} unit="°C" status={vs.bodyTemp || vs.temperature} icon={Thermometer} range={ranges.bodyTemp} />
        <VitalGauge label="Humidité" value={m.humidityPct} unit="%" status={vs.humidity} icon={Wind} range="30–70 %" />
        <VitalGauge label="FC" value={m.heartRateBpm} unit="bpm" status={vs.heartRate} icon={Heart} range={ranges.heartRate} />
        <VitalGauge label="Ambiance" value={m.ambientTempC} unit="°C" status="ok" icon={Thermometer} range="18–28 °C" />
      </div>

      {expanded && (
        <div className="wear-collar-detail">
          <div className="wear-detail-grid">
            <div className="wear-detail-panel">
              <h4><Moon size={16} /> Sommeil (nuit)</h4>
              <p className="wear-detail-stat">
                <strong>{sleep.hours ?? '—'} h</strong>
                <span>Qualité {sleep.quality ?? '—'} %</span>
              </p>
              <p className="wear-detail-meta">Objectif {sleep.targetHours}</p>
              <div className="wear-progress">
                <div className="wear-progress__fill" style={{ width: `${sleep.quality ?? 0}%`, background: sleep.status === 'good' ? '#059669' : '#d97706' }} />
              </div>
            </div>

            <div className="wear-detail-panel">
              <h4><Target size={16} /> Activité du jour</h4>
              <p className="wear-detail-stat">
                <strong>{(m.stepsToday ?? 0).toLocaleString('fr-FR')}</strong>
                <span>/ {goal.steps?.toLocaleString('fr-FR')} pas</span>
              </p>
              <p className="wear-detail-meta">{m.activeMinutesToday ?? 0} min actives · {m.caloriesBurned ?? 0} kcal</p>
              <div className="wear-progress">
                <div className="wear-progress__fill" style={{ width: `${stepPct}%`, background: stepPct >= 80 ? '#059669' : '#0ea5e9' }} />
              </div>
            </div>

            {m.lastLocation && (
              <div className="wear-detail-panel">
                <h4><MapPin size={16} /> Localisation</h4>
                <p className="wear-detail-stat"><strong>{m.lastLocation}</strong></p>
                <Link to="/found-me" className="wear-detail-link">Find Me — signalement →</Link>
              </div>
            )}
          </div>

          <div className="wear-detail-section">
            <h4>Timeline activité — 24 h</h4>
            <ActivityTimeline timeline={collar.activityTimeline} />
          </div>

          {weeklyData.length > 0 && (
            <div className="wear-detail-section">
              <h4>Tendance 7 jours</h4>
              <ResponsiveContainer width="100%" height={160}>
                <ComposedChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="well" tick={{ fontSize: 10 }} domain={[0, 100]} />
                  <YAxis yAxisId="steps" orientation="right" tick={{ fontSize: 10 }} hide />
                  <Tooltip />
                  <Area yAxisId="well" type="monotone" dataKey="wellness" fill="#ecfdf5" stroke="#059669" name="Bien-être" />
                  <Bar yAxisId="steps" dataKey="steps" fill="#0ea5e9" opacity={0.5} name="Pas" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="well" type="monotone" dataKey="avgHr" stroke="#dc2626" strokeWidth={2} dot={false} name="FC moy." />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}

          {chartData.length > 1 && (
            <div className="wear-chart">
              <p className="wear-chart__title">Courbe 12 h — rythme &amp; oxygène</p>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="t" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="hr" tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                  <YAxis yAxisId="spo2" orientation="right" domain={[90, 100]} hide />
                  <Tooltip />
                  <Line yAxisId="hr" type="monotone" dataKey="hr" stroke="#dc2626" strokeWidth={2} dot={false} name="bpm" />
                  <Line yAxisId="spo2" type="monotone" dataKey="spo2" stroke="#059669" strokeWidth={2} dot={false} name="SpO₂ %" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {(collar.insights || []).length > 0 && (
            <div className="wear-insights">
              <h4>Conseils personnalisés</h4>
              {collar.insights.map((tip) => (
                <div key={tip.id} className={`wear-insight wear-insight--${tip.priority}`}>
                  <span>{tip.icon}</span>
                  <div>
                    <strong>{tip.title}</strong>
                    <p>{tip.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="wear-detail-actions">
            <Link to="/veterinary" className="wear-btn wear-btn--vet">
              <Stethoscope size={14} /> Téléconsultation véto
            </Link>
            <Link to="/medical-dossier" className="wear-btn wear-btn--ghost">
              <Share2 size={14} /> Dossier médical
            </Link>
          </div>
        </div>
      )}

      <footer className="wear-collar-card__footer">
        {collar.batteryPercent != null && (
          <span className={collar.batteryPercent < 30 ? 'wear-batt-low' : ''}>
            🔋 {collar.batteryPercent}%
          </span>
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

  const [expandedId, setExpandedId] = useState(null);

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
            SpO₂, rythme cardiaque, sommeil, activité et état de vos animaux en temps réel.
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
        <div className="wear-kpi wear-kpi--wellness">
          <WellnessRing score={counts.avgWellness} size={48} />
          <div>
            <strong>{counts.avgWellness ?? '—'}</strong>
            <span>Score bien-être moyen</span>
          </div>
        </div>
        <div className="wear-kpi">
          <strong>{counts.online ?? 0}/{counts.total ?? 0}</strong>
          <span>Colliers en ligne</span>
        </div>
        <div className="wear-kpi">
          <strong>{collars.filter((c) => ['active', 'play'].includes(c.metrics?.activityLevel)).length}</strong>
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
              expanded={expandedId === c.id}
              onToggle={() => setExpandedId(expandedId === c.id ? null : c.id)}
            />
          ))}
        </div>
      )}

      <section className="wear-features">
        <h3>Capteurs intégrés PetCollar Vital</h3>
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
