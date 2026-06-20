import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Play, Calendar, Package, ChevronRight, AlertTriangle, CheckCircle2, Clock,
  Wifi, Scale, Thermometer,
} from 'lucide-react';
import { analyzeFeederHabits } from '../utils/feederHabitAnalyzer';
import {
  DEMO_FEEDER_SCHEDULE,
  DEMO_FEEDER_PLAN,
  DEMO_FEEDER_STATS,
  DEMO_FEEDER_HISTORY_LOGS,
  getDemoFeederBundle,
} from '../utils/clientDemoData';
import { predictFoodDepletion } from '../utils/iotIntelligenceEngine';
import { PLATFORM_IMAGES } from '../utils/platformImages';

const COMPLEMENTS = [
  { icon: '🦴', label: 'Friandises dentaires', stock: 85, color: '#f59e0b' },
  { icon: '💊', label: 'Oméga-3', stock: 62, color: '#8b5cf6' },
  { icon: '🌿', label: 'Complément articulations', stock: 48, color: '#059669' },
];

const parseDate = (v) => {
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export const getScheduleSlots = (schedules = [], history = []) => {
  const now = new Date();
  const todayDispenses = history.filter((log) => {
    const d = parseDate(log.createdAt);
    return d && isSameDay(d, now) && ['dispense', 'manual_request'].includes(log.eventType);
  });

  return schedules.map((sch) => {
    if (sch.enabled === false) return { ...sch, status: 'disabled' };
    const [h, m] = String(sch.time || '00:00').split(':').map(Number);
    const schedDate = new Date(now);
    schedDate.setHours(h, m, 0, 0);
    const matched = todayDispenses.some((log) => {
      const ld = parseDate(log.createdAt);
      return ld && Math.abs(ld - schedDate) < 90 * 60 * 1000;
    });
    if (matched) return { ...sch, status: 'done' };
    if (schedDate > now) return { ...sch, status: 'upcoming' };
    return { ...sch, status: 'missed' };
  });
};

export const getNextMeal = (slots = []) => {
  const next = slots.find((s) => s.status === 'upcoming');
  if (!next) return null;
  const [h, m] = next.time.split(':').map(Number);
  const at = new Date();
  at.setHours(h, m, 0, 0);
  const mins = Math.max(0, Math.round((at - new Date()) / 60000));
  return { ...next, minutesUntil: mins };
};

const statusLabel = {
  done: 'Servi',
  upcoming: 'À venir',
  missed: 'Manqué',
  disabled: 'Off',
};

const card = {
  background: '#fff',
  borderRadius: 16,
  padding: 20,
  boxShadow: '0 2px 14px rgba(15, 23, 42, 0.06)',
  border: '1px solid #f1f5f9',
};

/** Visualisation gamelle + réservoir en temps réel. */
export const FeederLiveBowl = ({
  reservoirPercent = 42,
  isLowFood = false,
  qualityScore = null,
  qualityLevel = 'good',
  petName = 'Max',
  animalPresent = false,
  todayGrams = 0,
  dailyTarget = 95,
  live = true,
}) => {
  const fillPct = Math.min(92, Math.max(8, reservoirPercent ?? 42));
  const adherence = dailyTarget > 0 ? Math.min(100, Math.round((todayGrams / dailyTarget) * 100)) : 0;
  const kibbleColor = isLowFood
    ? 'linear-gradient(180deg, #fcd34d 0%, #b45309 55%, #92400e 100%)'
    : 'linear-gradient(180deg, #d4a574 0%, #a67c52 55%, #8b6914 100%)';

  return (
    <div className={`iot-fq-viewport iot-fq-viewport--food iot-fq-viewport--${qualityLevel}${live ? ' iot-fq-viewport--pulse' : ''}`}>
      <p className="iot-live-feed__title">
        {live ? '● NOURRITURE LIVE' : 'État du distributeur'}
        {animalPresent && <span style={{ marginLeft: 8, color: '#86efac' }}>· Animal détecté</span>}
      </p>
      <div className="iot-fq-viewport__cam iot-fq-viewport__cam--bowl-scene">
        <div className="iot-petfood-scene iot-petfood-scene--live">
          <div
            className="iot-petfood-scene__bg"
            style={{ backgroundImage: `url(${PLATFORM_IMAGES.productFood})` }}
          />
          <div className="iot-petfood-scene__layout">
            <div className="iot-petfood-scene__bowl-wrap">
              <div className="iot-petfood-scene__bowl-rim" />
              <div className="iot-petfood-scene__bowl-inner">
                <div
                  className="iot-petfood-scene__kibble-mass"
                  style={{ height: `${fillPct}%`, background: kibbleColor }}
                >
                  <div className="iot-petfood-scene__kibble-grain" />
                  {[12, 28, 45, 62, 78].map((left) => (
                    <span
                      key={left}
                      className="iot-petfood-scene__kibble-dot"
                      style={{ left: `${left}%`, bottom: `${10 + (left % 3) * 8}%`, width: 8, height: 6 }}
                    />
                  ))}
                  {qualityLevel === 'bad' && <div className="iot-petfood-scene__mold" />}
                </div>
              </div>
              <span className="iot-petfood-scene__bowl-label">
                {petName} · {reservoirPercent ?? '—'} %
              </span>
            </div>
            <div className="iot-petfood-scene__complements">
              <p className="iot-petfood-scene__complements-title">Compléments</p>
              {COMPLEMENTS.map((c) => (
                <div key={c.label} className="iot-petfood-scene__complement" style={{ borderColor: c.color }}>
                  <span className="iot-petfood-scene__complement-icon">{c.icon}</span>
                  <span className="iot-petfood-scene__complement-label">{c.label}</span>
                  <span className="iot-petfood-scene__complement-stock">{c.stock} %</span>
                </div>
              ))}
            </div>
          </div>
          <div className="iot-petfood-scene__tags">
            <span className="iot-petfood-scene__tag">{todayGrams} g aujourd&apos;hui</span>
            <span className="iot-petfood-scene__tag">Objectif {dailyTarget} g</span>
            {qualityScore != null && (
              <span className="iot-petfood-scene__tag">Qualité {qualityScore}/100</span>
            )}
          </div>
        </div>
        <div className="iot-fq-viewport__overlay">
          <span className="iot-fq-live-badge">
            <span className="iot-fq-live-dot" /> LIVE
          </span>
          <span className="iot-fq-viewport__score">{adherence} % adhérence</span>
        </div>
      </div>
      <div className="iot-fq-viewport__meta">
        <span>Réservoir <strong>{reservoirPercent ?? '—'} %</strong></span>
        {isLowFood && (
          <span style={{ color: '#b45309', fontWeight: 700 }}>
            <AlertTriangle size={12} style={{ verticalAlign: 'middle' }} /> Recharge recommandée
          </span>
        )}
      </div>
    </div>
  );
};

/** Timeline des repas programmés. */
export const FeederScheduleTimeline = ({ slots = [], nextMeal = null }) => (
  <div style={card} className="fd-schedule-card">
    <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
      <Calendar size={18} color="#7c3aed" /> Planning du jour
    </h3>
    {nextMeal && (
      <p style={{ margin: '0 0 12px', fontSize: 13, color: '#64748b' }}>
        Prochain repas : <strong style={{ color: '#1e40af' }}>{nextMeal.time}</strong>
        {' '}({nextMeal.portionGrams} g — {nextMeal.label})
        {nextMeal.minutesUntil > 0 && (
          <span> · dans {nextMeal.minutesUntil < 60 ? `${nextMeal.minutesUntil} min` : `${Math.round(nextMeal.minutesUntil / 60)} h`}</span>
        )}
      </p>
    )}
    <ul className="iot-fq-schedule-list">
      {slots.length === 0 ? (
        <li style={{ color: '#94a3b8', fontSize: 13 }}>Aucun créneau — configurez le planning dans le distributeur.</li>
      ) : (
        slots.map((s) => (
          <li
            key={s.id || s.time}
            className={`iot-fq-slot iot-fq-slot--${s.status === 'done' ? 'done' : s.status === 'missed' ? 'missed' : s.status === 'upcoming' ? 'upcoming' : ''}`}
          >
            <span className="iot-fq-slot-time">{s.time}</span>
            <span className="iot-fq-slot-label">{s.label || 'Repas'} · {s.portionGrams} g</span>
            <span className="iot-fq-slot-status">
              {s.status === 'done' && <CheckCircle2 size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />}
              {s.status === 'missed' && <AlertTriangle size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />}
              {s.status === 'upcoming' && <Clock size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />}
              {statusLabel[s.status] || s.status}
            </span>
          </li>
        ))
      )}
    </ul>
    <Link to="/pet-feeder" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 12, fontSize: 13, fontWeight: 700, color: '#2563eb', textDecoration: 'none' }}>
      Gérer le planning <ChevronRight size={14} />
    </Link>
  </div>
);

/** Chaîne capteurs ESP32. */
export const FeederPipelineStrip = () => (
  <div className="fd-pipeline">
    {[
      { icon: '👀', label: 'Capteur IR', desc: 'Détection animal' },
      { icon: '⚙️', label: 'Servo SG90', desc: 'Trappe ouverture' },
      { icon: '🔩', label: 'Moteur DC', desc: 'Vis distributeur' },
      { icon: '⚖️', label: 'HX711', desc: 'Poids servi' },
      { icon: '📡', label: 'HC-SR04', desc: 'Niveau réservoir' },
    ].map((step, i, arr) => (
      <React.Fragment key={step.label}>
        <div className="fd-pipeline__step">
          <span className="fd-pipeline__icon">{step.icon}</span>
          <strong>{step.label}</strong>
          <small>{step.desc}</small>
        </div>
        {i < arr.length - 1 && <span className="fd-pipeline__arrow">→</span>}
      </React.Fragment>
    ))}
  </div>
);

const QuickAction = ({ to, icon, label, sub, primary }) => (
  <Link
    to={to}
    className={`fd-action${primary ? ' fd-action--primary' : ''}`}
  >
    <span className="fd-action__icon">{icon}</span>
    <span>
      <strong>{label}</strong>
      {sub && <small>{sub}</small>}
    </span>
    <ChevronRight size={16} className="fd-action__chev" />
  </Link>
);

/**
 * Panneau principal — onglet Distribution nourriture (Centre IoT).
 */
const FoodDistributionPanel = ({ pack = {}, demoMode = false }) => {
  const feederDevice = (pack.devices || []).find((d) => d.type === 'feeder');
  const camDevice = (pack.devices || []).find((d) => d.type === 'feeder-cam');
  const demoBundle = demoMode ? getDemoFeederBundle() : null;

  const feeder = demoBundle?.feeder || {
    name: feederDevice?.name,
    status: feederDevice?.status,
    reservoirPercent: feederDevice?.metrics?.reservoirPercent,
    isLowFood: feederDevice?.metrics?.isLowFood,
    animalPresent: false,
    temperature: feederDevice?.metrics?.temperature,
  };
  const stats = demoBundle?.stats || {
    todayGrams: feederDevice?.metrics?.todayGrams ?? 0,
    dailyAverage: feederDevice?.metrics?.avgDailyGrams ?? 65,
  };
  const plan = demoBundle?.plan || DEMO_FEEDER_PLAN;
  const schedules = feeder?.schedules || DEMO_FEEDER_SCHEDULE;
  const history = demoBundle?.history || DEMO_FEEDER_HISTORY_LOGS;

  const slots = useMemo(() => getScheduleSlots(schedules, history), [schedules, history]);
  const nextMeal = useMemo(() => getNextMeal(slots), [slots]);

  const habit = useMemo(() => analyzeFeederHabits({
    feeder,
    stats: demoBundle?.stats || { ...DEMO_FEEDER_STATS, todayGrams: stats.todayGrams },
    plan,
    history,
    schedules,
  }), [feeder, stats, plan, history, schedules, demoBundle]);

  const depletion = feederDevice ? predictFoodDepletion(feederDevice) : null;
  const camMetrics = camDevice?.metrics || {};
  const qualityScore = camMetrics.qualityScore ?? (demoMode ? 72 : null);
  const qualityLevel = camMetrics.foodQuality
    || (qualityScore != null && qualityScore < 50 ? 'bad' : qualityScore != null && qualityScore < 75 ? 'warning' : 'good');

  const dailyTarget = plan?.dailyGrams || stats.dailyAverage || 95;
  const petName = plan?.pet?.name || feederDevice?.petName || 'Animal';

  return (
    <section className="fd-panel">
      <div className="fd-panel__head">
        <div>
          <span className="fd-panel__badge">ESP32 · Distribution intelligente</span>
          <h2>{feeder?.name || 'Distributeur connecté'}</h2>
          <p>
            Portions automatiques, suivi nutritionnel et alertes en temps réel
            {feeder?.status === 'online' ? ' · En ligne' : ' · Hors ligne'}.
          </p>
        </div>
        <div className="fd-panel__kpis">
          <div className="fd-kpi">
            <Wifi size={16} color={feeder?.status === 'online' ? '#059669' : '#94a3b8'} />
            <strong>{feeder?.status === 'online' ? 'En ligne' : 'Offline'}</strong>
            <span>Connexion</span>
          </div>
          <div className="fd-kpi">
            <Scale size={16} color="#2563eb" />
            <strong>{stats.todayGrams} g</strong>
            <span>Aujourd&apos;hui</span>
          </div>
          <div className="fd-kpi">
            <Thermometer size={16} color="#f97316" />
            <strong>{feeder?.temperature ?? camMetrics.temperatureC ?? '—'}°C</strong>
            <span>Ambiance</span>
          </div>
          <div className="fd-kpi fd-kpi--score">
            <strong style={{ color: habit.healthScore >= 70 ? '#059669' : '#d97706' }}>{habit.healthScore}</strong>
            <span>Score santé</span>
          </div>
        </div>
      </div>

      <FeederPipelineStrip />

      <div className="fd-panel__grid">
        <FeederLiveBowl
          reservoirPercent={feeder?.reservoirPercent}
          isLowFood={feeder?.isLowFood}
          qualityScore={qualityScore}
          qualityLevel={qualityLevel}
          petName={petName}
          animalPresent={feeder?.animalPresent}
          todayGrams={stats.todayGrams}
          dailyTarget={dailyTarget}
        />
        <div className="fd-panel__side">
          <FeederScheduleTimeline slots={slots} nextMeal={nextMeal} />
          {depletion && (
            <div style={{ ...card, marginTop: 12, borderLeft: `4px solid ${depletion.urgency === 'high' ? '#dc2626' : depletion.urgency === 'medium' ? '#f59e0b' : '#059669'}` }}>
              <strong style={{ fontSize: 14 }}>📦 Stock croquettes</strong>
              <p style={{ margin: '6px 0 0', fontSize: 13, color: '#64748b' }}>{depletion.aiSummary}</p>
              {depletion.urgency !== 'low' && (
                <Link to="/client-subscriptions" style={{ fontSize: 12, fontWeight: 700, color: '#2563eb' }}>
                  Commander un réappro →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {(habit.alerts.length > 0 || habit.insights.length > 0) && (
        <div className="fd-insights">
          {habit.alerts.slice(0, 2).map((a) => (
            <div key={a.id} className={`fd-insight fd-insight--${a.level}`}>
              <AlertTriangle size={16} />
              <div>
                <strong>{a.title}</strong>
                <p>{a.message}</p>
              </div>
            </div>
          ))}
          {habit.insights.slice(0, 2).map((ins, i) => (
            <div key={i} className="fd-insight fd-insight--info">
              <span>{ins.icon}</span>
              <p>{ins.text}</p>
            </div>
          ))}
        </div>
      )}

      <div className="fd-actions">
        <QuickAction to="/pet-feeder" icon={<Play size={18} />} label="Distribuer maintenant" sub={`Portion suggérée ${plan?.portionGrams || 30} g`} primary />
        <QuickAction to="/pet-feeder" icon={<Package size={18} />} label="Recharger le réservoir" sub="Enregistrer une recharge" />
        <QuickAction to="/client-iot?tab=detection" icon="📷" label="Contrôle qualité ESP32-CAM" sub={qualityScore != null ? `Score ${qualityScore}/100` : 'Surveillance bac'} />
        <QuickAction to="/pet-adaptive-nutrition" icon="🥗" label="Plan nutritionnel IA" sub={`${dailyTarget} g/jour · ${plan?.mealsPerDay || 3} repas`} />
      </div>
    </section>
  );
};

export default FoodDistributionPanel;
