import React, { useCallback, useEffect, useState } from 'react';
import { Camera, Thermometer, Droplets, RefreshCw, Play, Square, Clock, Calendar } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import {
  fetchFoodQualityState,
  runEsp32CamSimulation,
  saveFoodQualitySchedules,
} from '../services/iotFoodQualityService';
import { QUALITY_LABELS, formatTimeFr, formatTimeShort, buildScheduleStatuses, getNextScheduledCheck } from '../utils/foodQualityEngine';

const STATUS_META = {
  done: { label: 'Effectué', className: 'iot-fq-slot--done', icon: '✅' },
  missed: { label: 'Manqué', className: 'iot-fq-slot--missed', icon: '⚠️' },
  upcoming: { label: 'À venir', className: 'iot-fq-slot--upcoming', icon: '⏳' },
};

const IoTFoodQualityCamPanel = ({ loading: packLoading }) => {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setState(await fetchFoodQualityState());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!simulating) return undefined;
    const id = setInterval(async () => {
      const reading = await runEsp32CamSimulation();
      setState((prev) => {
        const history = [reading, ...(prev?.history || []).slice(0, 19)];
        return {
          ...prev,
          current: reading,
          history,
          mode: 'demo',
          scheduleStatuses: prev?.schedules
            ? buildScheduleStatuses(prev.schedules, history)
            : prev?.scheduleStatuses,
        };
      });
    }, 4000);
    return () => clearInterval(id);
  }, [simulating]);

  const simulateOnce = async (scenario) => {
    setBusy(true);
    try {
      const reading = await runEsp32CamSimulation(scenario);
      setState((prev) => {
        const history = [reading, ...(prev?.history || []).slice(0, 19)];
        return {
          ...prev,
          current: reading,
          history,
          scheduleStatuses: buildScheduleStatuses(prev?.schedules || [], history),
        };
      });
    } finally {
      setBusy(false);
    }
  };

  const toggleSchedule = async (id) => {
    const schedules = (state?.schedules || []).map((s) => (
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
    const saved = await saveFoodQualitySchedules(schedules);
    setState((prev) => ({
      ...prev,
      schedules: saved,
      nextCheck: getNextScheduledCheck(saved),
      scheduleStatuses: buildScheduleStatuses(saved, prev?.history || []),
    }));
  };

  if (packLoading || loading) {
    return <p className="iot-muted">Connexion ESP32-CAM…</p>;
  }

  const cur = state?.current || {};
  const meta = QUALITY_LABELS[cur.quality] || QUALITY_LABELS.good;
  const chartData = (state?.history || []).slice(0, 12).reverse().map((r) => ({
    t: formatTimeShort(r.analyzedAt),
    score: r.qualityScore,
  }));
  const nextCheck = state?.nextCheck;

  return (
    <div className="iot-food-quality">
      <p className="iot-summary">
        <Camera size={16} aria-hidden />
        ESP32-CAM surveille le bac croquettes en temps réel (comme un réfrigérateur connecté) :
        couleur, moisissure, température et humidité → qualité <strong>bonne</strong> ou <strong>mauvaise</strong>.
      </p>

      <div className="iot-fq-device">
        <span>📷 {state?.device?.name || 'ESP32-CAM'}</span>
        <span className="iot-fq-status">🟢 {state?.device?.status || 'online'}</span>
        {state?.mode === 'demo' && <span className="iot-fq-demo">Mode simulation</span>}
      </div>

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
          <strong>{meta.label}</strong>
          <p>Score {cur.qualityScore ?? '—'}/100 · {meta.fridge}</p>
        </div>
      </div>

      <p className="iot-ai-text">{cur.aiSummary}</p>

      <div className="iot-fq-metrics">
        <div><Thermometer size={14} /> {cur.temperatureC ?? '—'} °C</div>
        <div><Droplets size={14} /> {cur.humidityPct ?? '—'} % HR</div>
        <div>RGB {cur.avgR}/{cur.avgG}/{cur.avgB}</div>
        <div>Moisissure ~{((cur.moldPixelRatio ?? 0) * 100).toFixed(1)} %</div>
      </div>

      {(state?.scheduleStatuses || []).length > 0 && (
        <section className="iot-fq-schedules">
          <h4><Clock size={16} /> Horaires de contrôle ESP32-CAM</h4>
          <p className="iot-fq-schedules-hint">
            Analyses automatiques avant chaque repas et la nuit — synchronisées avec le distributeur Max.
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
                        · {qMeta.label} ({slot.qualityScore}/100)
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
          Simuler ✅ Bonne
        </button>
        <button type="button" className="iot-fq-btn iot-fq-btn--warn" disabled={busy} onClick={() => simulateOnce('warning')}>
          Simuler ⚠️ Limite
        </button>
        <button type="button" className="iot-fq-btn iot-fq-btn--bad" disabled={busy} onClick={() => simulateOnce('bad')}>
          Simuler 🚫 Mauvaise
        </button>
        <button
          type="button"
          className={`iot-fq-btn iot-fq-btn--live${simulating ? ' is-on' : ''}`}
          onClick={() => setSimulating((s) => !s)}
        >
          {simulating ? <Square size={14} /> : <Play size={14} />}
          {simulating ? 'Stop flux' : 'Flux temps réel'}
        </button>
        <button type="button" className="iot-fq-btn iot-fq-btn--ghost" onClick={load} disabled={busy}>
          <RefreshCw size={14} /> Actualiser
        </button>
      </div>

      {chartData.length > 1 && (
        <div className="iot-fq-chart">
          <h4>Historique score qualité (par horaire)</h4>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="t" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#7c3aed" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {(state?.history || []).length > 0 && (
        <section className="iot-fq-history">
          <h4>Journal des analyses</h4>
          <div className="iot-fq-history-table-wrap">
            <table className="iot-fq-history-table">
              <thead>
                <tr>
                  <th>Horaire</th>
                  <th>Qualité</th>
                  <th>Score</th>
                  <th>Temp.</th>
                  <th>HR</th>
                </tr>
              </thead>
              <tbody>
                {state.history.slice(0, 8).map((r, i) => {
                  const q = QUALITY_LABELS[r.quality] || QUALITY_LABELS.good;
                  return (
                    <tr key={`${r.analyzedAt}-${i}`}>
                      <td>{formatTimeFr(r.analyzedAt)}</td>
                      <td><span style={{ color: q.color }}>{q.icon} {q.label}</span></td>
                      <td>{r.qualityScore}/100</td>
                      <td>{r.temperatureC} °C</td>
                      <td>{r.humidityPct} %</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <details className="iot-fq-firmware">
        <summary>Code ESP32-CAM & simulateur Node</summary>
        <p>Firmware : <code>firmware/esp32/PetFoodQualityESP32CAM/</code></p>
        <p>Simulateur sans matériel :</p>
        <pre className="iot-fq-code">{`node scripts/simulate-esp32cam-food-quality.mjs
# ou avec scénario :
node scripts/simulate-esp32cam-food-quality.mjs --scenario bad --interval 3`}</pre>
      </details>
    </div>
  );
};

export default IoTFoodQualityCamPanel;
