import React, { useCallback, useState } from 'react';
import { Camera, Thermometer, Droplets, RefreshCw, Play, Square, Clock, Calendar, Wifi, WifiOff, Package, Bug } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import {
  runEsp32CamSimulation,
  saveFoodQualitySchedules,
} from '../services/iotFoodQualityService';
import { dispatchFoodQualityAlerts } from '../services/foodQualityNotificationService';
import useFoodQualityLive from '../hooks/useFoodQualityLive';
import FoodQualityLiveViewport from './FoodQualityLiveViewport';
import FoodQualityOledDisplay from './FoodQualityOledDisplay';
import FoodQualityAiDetectionPanel from './FoodQualityAiDetectionPanel';
import FoodQualityCriticalBanner from './FoodQualityCriticalBanner';
import { QUALITY_LABELS, formatTimeFr, formatTimeShort, buildScheduleStatuses, getNextScheduledCheck, ALERT_TEMP_THRESHOLD_C, ALERT_HUMIDITY_THRESHOLD_PCT, NON_CONFORME_THRESHOLD, CAPTURE_INTERVAL_MINUTES } from '../utils/foodQualityEngine';

const STATUS_META = {
  done: { label: 'Effectué', className: 'iot-fq-slot--done', icon: '✅' },
  missed: { label: 'Manqué', className: 'iot-fq-slot--missed', icon: '⚠️' },
  upcoming: { label: 'À venir', className: 'iot-fq-slot--upcoming', icon: '⏳' },
};

const USE_CASE_STEPS = [
  'Le client remplit le distributeur de nourriture.',
  'L\'ESP32-CAM capture une image toutes les 30 minutes.',
  'Les capteurs mesurent température, humidité et quantité restante.',
  'Le module IA détecte moisissures, insectes et dégradation.',
  'L\'afficheur LCD affiche : PETFOODIOT — Qualité, Stock, État (Frais).',
  'Le client consulte les données sur l\'application mobile PetFoodTN.',
];

const ALT_SCENARIO_STEPS = [
  'Si température > 30 °C, humidité > 70 % et qualité < 50 % :',
  'LCD : ⚠ ALERTE — Qualité : 42 % — Nourriture altérée.',
  'Notification client + information vétérinaire.',
  'Recommandation : remplacer la nourriture.',
];

const IoTFoodQualityCamPanel = ({ loading: packLoading }) => {
  const {
    state,
    loading,
    isLive,
    setIsLive,
    lastTickAt,
    socketConnected,
    reload,
    applyReading,
    patchState,
    lastAlert,
  } = useFoodQualityLive({ enabled: true, demoSimulate: true });

  const [busy, setBusy] = useState(false);
  const [localAlert, setLocalAlert] = useState(null);

  const simulateOnce = async (scenario) => {
    setBusy(true);
    try {
      const reading = await runEsp32CamSimulation(scenario, state?.device);
      applyReading(reading);
      const alertResult = await dispatchFoodQualityAlerts(reading, state?.device);
      if (alertResult.sent) setLocalAlert(alertResult);
    } finally {
      setBusy(false);
    }
  };

  const toggleSchedule = useCallback(async (id) => {
    const schedules = (state?.schedules || []).map((s) => (
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
    const saved = await saveFoodQualitySchedules(schedules);
    patchState((prev) => ({
      ...prev,
      schedules: saved,
      nextCheck: getNextScheduledCheck(saved),
      scheduleStatuses: buildScheduleStatuses(saved, prev?.history || []),
    }));
  }, [state?.schedules, patchState]);

  if (packLoading || loading) {
    return <p className="iot-muted">Connexion ESP32-CAM…</p>;
  }

  const cur = state?.current || {};
  const meta = QUALITY_LABELS[cur.quality] || QUALITY_LABELS.good;
  const chartData = (state?.history || []).slice(0, 12).reverse().map((r) => ({
    t: formatTimeShort(r.analyzedAt),
    score: r.qualityScore,
    stock: r.stockLevelPct,
  }));
  const nextCheck = state?.nextCheck;
  const alertInfo = localAlert || lastAlert;

  return (
    <div className="iot-food-quality">
      <header className="iot-fq-hero">
        <div className="iot-fq-hero__content">
          <span className="iot-fq-hero__badge">PetFoodIoT · ESP32-CAM</span>
          <h3>Surveillance intelligente qualité aliments</h3>
          <p>
            Capture toutes les {CAPTURE_INTERVAL_MINUTES} min · IA vision · LCD local <strong>PETFOODIOT</strong>
          </p>
        </div>
        <div className="iot-fq-thresholds">
          <span className={`iot-fq-threshold${(cur.temperatureC ?? 0) > ALERT_TEMP_THRESHOLD_C ? ' iot-fq-threshold--active' : ''}`}>
            Temp &gt; {ALERT_TEMP_THRESHOLD_C}°C
          </span>
          <span className={`iot-fq-threshold${(cur.humidityPct ?? 0) > ALERT_HUMIDITY_THRESHOLD_PCT ? ' iot-fq-threshold--active' : ''}`}>
            HR &gt; {ALERT_HUMIDITY_THRESHOLD_PCT}%
          </span>
          <span className={`iot-fq-threshold${(cur.qualityScore ?? 100) < NON_CONFORME_THRESHOLD ? ' iot-fq-threshold--active' : ''}`}>
            Qualité &lt; {NON_CONFORME_THRESHOLD}%
          </span>
        </div>
      </header>

      <section className="iot-fq-usecase">
        <h4>Cas d&apos;usage — Surveillance intelligente qualité aliments</h4>
        <ol>
          {USE_CASE_STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <p className="iot-fq-usecase-actors">
          Acteurs : Client · Système IoT PetFoodTN · ESP32-CAM · Module IA · Afficheur OLED
        </p>
      </section>

      <section className="iot-fq-usecase iot-fq-usecase--alt">
        <h4>Scénario alternatif — Nourriture détériorée</h4>
        <ol>
          {ALT_SCENARIO_STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <button
          type="button"
          className="iot-fq-btn iot-fq-btn--alt-scenario"
          disabled={busy}
          onClick={() => simulateOnce('deteriorated')}
        >
          ▶ Lancer scénario alternatif (42 %)
        </button>
      </section>

      <FoodQualityCriticalBanner reading={cur} lastAlert={alertInfo} />

      <p className="iot-summary">
        <Camera size={16} aria-hidden />
        Récipient connecté — analyse IA en <strong>temps réel</strong> avec affichage OLED local
        et enregistrement base de données PetFoodTN.
      </p>

      <div className="iot-fq-device">
        <span>📷 {state?.device?.name || 'ESP32-CAM'}</span>
        <span className="iot-fq-status">🟢 {state?.device?.status || 'online'}</span>
        {isLive && (
          <span className="iot-fq-live-pill">
            <span className="iot-fq-live-dot" /> Flux actif · 5 s
          </span>
        )}
        {socketConnected ? (
          <span className="iot-fq-socket iot-fq-socket--on" title="Socket.IO connecté">
            <Wifi size={13} /> Push temps réel
          </span>
        ) : (
          <span className="iot-fq-socket" title="Polling actif">
            <WifiOff size={13} /> Polling
          </span>
        )}
        {state?.mode === 'demo' && <span className="iot-fq-demo">Mode simulation</span>}
      </div>

      <div className="iot-fq-live-grid iot-fq-live-grid--glass">
        <FoodQualityLiveViewport reading={cur} isLive={isLive} lastTickAt={lastTickAt} />
        <FoodQualityOledDisplay reading={cur} />
      </div>

      <FoodQualityAiDetectionPanel reading={cur} />

      <div className="iot-fq-times">
        <div className="iot-fq-time-card">
          <Clock size={16} />
          <div>
            <span>Dernière analyse</span>
            <strong>{formatTimeFr(cur.analyzedAt)}</strong>
          </div>
        </div>
        {nextCheck && (
          <div className="iot-fq-time-card iot-fq-time-card--next">
            <Calendar size={16} />
            <div>
              <span>Prochain contrôle</span>
              <strong>
                {nextCheck.time} — {nextCheck.label}
                {!nextCheck.isToday && ' (demain)'}
              </strong>
            </div>
          </div>
        )}
      </div>

      <div className={`iot-fq-badge iot-fq-badge--${cur.quality || 'good'}`}>
        <span className="iot-fq-badge-icon">{meta.icon}</span>
        <div>
          <strong>{cur.state || meta.state} — {cur.qualityScore ?? '—'}%</strong>
          <p>{meta.fridge} · {cur.recommendedAction || 'Aucune action'}</p>
        </div>
      </div>

      <p className="iot-ai-text">{cur.aiSummary}</p>

      <div className="iot-fq-metrics">
        <div><Thermometer size={14} /> {cur.temperatureC ?? '—'} °C</div>
        <div><Droplets size={14} /> {cur.humidityPct ?? '—'} % HR</div>
        <div><Package size={14} /> Stock {cur.stockLevelPct ?? '—'} %</div>
        <div><Bug size={14} /> Insectes {((cur.insectPixelRatio ?? 0) * 100).toFixed(2)} %</div>
        <div>RGB {cur.avgR}/{cur.avgG}/{cur.avgB}</div>
        <div>Moisissure {((cur.moldPixelRatio ?? 0) * 100).toFixed(1)} %</div>
      </div>

      {(state?.scheduleStatuses || []).length > 0 && (
        <section className="iot-fq-schedules">
          <h4><Clock size={16} /> Captures périodiques ESP32-CAM</h4>
          <p className="iot-fq-schedules-hint">
            Images automatiques avant chaque repas — synchronisées avec le distributeur Max.
          </p>
          <ul className="iot-fq-schedule-list">
            {state.scheduleStatuses.map((slot) => {
              const st = STATUS_META[slot.status] || STATUS_META.upcoming;
              const qMeta = slot.quality ? QUALITY_LABELS[slot.quality] : null;
              return (
                <li key={slot.id} className={`iot-fq-slot ${st.className}`}>
                  <span className="iot-fq-slot-time">{slot.time}</span>
                  <span className="iot-fq-slot-label">{slot.label}</span>
                  <span className="iot-fq-slot-status">
                    {st.icon} {st.label}
                    {qMeta && slot.reading && (
                      <span style={{ color: qMeta.color, marginLeft: 6 }}>
                        · {qMeta.state || qMeta.label} ({slot.qualityScore}%)
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    className="iot-fq-slot-toggle"
                    title={slot.enabled !== false ? 'Désactiver' : 'Activer'}
                    onClick={() => toggleSchedule(slot.id)}
                  >
                    {slot.enabled !== false ? 'ON' : 'OFF'}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <div className="iot-fq-actions">
        <button type="button" className="iot-fq-btn" disabled={busy} onClick={() => simulateOnce('good')}>
          Simuler 92% Bon
        </button>
        <button type="button" className="iot-fq-btn iot-fq-btn--warn" disabled={busy} onClick={() => simulateOnce('warning')}>
          Simuler ⚠️ Limite
        </button>
        <button type="button" className="iot-fq-btn iot-fq-btn--bad" disabled={busy} onClick={() => simulateOnce('deteriorated')}>
          Simuler ⚠️ 42% Non conforme
        </button>
        <button type="button" className="iot-fq-btn iot-fq-btn--bad" disabled={busy} onClick={() => simulateOnce('critical')}>
          Simuler 🚨 35% Critique
        </button>
        <button
          type="button"
          className={`iot-fq-btn iot-fq-btn--live${isLive ? ' is-on' : ''}`}
          onClick={() => setIsLive((s) => !s)}
        >
          {isLive ? <Square size={14} /> : <Play size={14} />}
          {isLive ? 'Pause flux' : 'Reprendre flux'}
        </button>
        <button type="button" className="iot-fq-btn iot-fq-btn--ghost" onClick={reload} disabled={busy}>
          <RefreshCw size={14} /> Actualiser
        </button>
      </div>

      {chartData.length > 1 && (
        <div className="iot-fq-chart">
          <h4>Historique qualité & stock (base PetFoodTN)</h4>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="t" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="score" name="Qualité %" stroke="#7c3aed" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="stock" name="Stock %" stroke="#059669" strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {(state?.history || []).length > 0 && (
        <section className="iot-fq-history">
          <h4>Journal des analyses (BDD)</h4>
          <div className="iot-fq-history-table-wrap">
            <table className="iot-fq-history-table">
              <thead>
                <tr>
                  <th>Horaire</th>
                  <th>État</th>
                  <th>Score</th>
                  <th>Stock</th>
                  <th>Temp.</th>
                </tr>
              </thead>
              <tbody>
                {state.history.slice(0, 8).map((r) => {
                  const q = QUALITY_LABELS[r.quality] || QUALITY_LABELS.good;
                  return (
                    <tr key={r.analyzedAt}>
                      <td>{formatTimeFr(r.analyzedAt)}</td>
                      <td><span style={{ color: q.color }}>{q.icon} {r.state || q.state}</span></td>
                      <td>{r.qualityScore}%</td>
                      <td>{r.stockLevelPct ?? '—'} %</td>
                      <td>{r.temperatureC} °C</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <details className="iot-fq-firmware">
        <summary>Firmware ESP32-CAM + OLED & simulateur Node</summary>
        <p>Firmware : <code>firmware/esp32/PetFoodQualityESP32CAM/</code></p>
        <p>Afficheur : SSD1306 128×64 (I2C SDA=14, SCL=15)</p>
        <pre className="iot-fq-code">{`node scripts/simulate-esp32cam-food-quality.mjs
node scripts/simulate-esp32cam-food-quality.mjs --scenario critical --interval 3`}</pre>
      </details>
    </div>
  );
};

export default IoTFoodQualityCamPanel;
