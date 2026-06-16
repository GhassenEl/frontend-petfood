import React, { useCallback, useEffect, useState } from 'react';
import { Camera, Thermometer, Droplets, RefreshCw, Play, Square } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import {
  fetchFoodQualityState,
  runEsp32CamSimulation,
} from '../services/iotFoodQualityService';
import { QUALITY_LABELS } from '../utils/foodQualityEngine';

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
      setState((prev) => ({
        ...prev,
        current: reading,
        history: [reading, ...(prev?.history || []).slice(0, 19)],
        mode: 'demo',
      }));
    }, 4000);
    return () => clearInterval(id);
  }, [simulating]);

  const simulateOnce = async (scenario) => {
    setBusy(true);
    try {
      const reading = await runEsp32CamSimulation(scenario);
      setState((prev) => ({
        ...prev,
        current: reading,
        history: [reading, ...(prev?.history || []).slice(0, 19)],
      }));
    } finally {
      setBusy(false);
    }
  };

  if (packLoading || loading) {
    return <p className="iot-muted">Connexion ESP32-CAM…</p>;
  }

  const cur = state?.current || {};
  const meta = QUALITY_LABELS[cur.quality] || QUALITY_LABELS.good;
  const chartData = (state?.history || []).slice(0, 12).reverse().map((r, i) => ({
    t: new Date(r.analyzedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    score: r.qualityScore,
  }));

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
          <h4>Historique score qualité (ESP32-CAM)</h4>
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
