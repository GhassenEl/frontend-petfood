import React, { useState } from 'react';
import { Camera, Thermometer, Droplets, RefreshCw, Play, Square, Package, Wifi, WifiOff } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import {
  runEsp32CamSimulation,
} from '../services/iotFoodQualityService';
import { dispatchFoodQualityAlerts } from '../services/foodQualityNotificationService';
import useFoodQualityLive from '../hooks/useFoodQualityLive';
import FoodQualityLiveViewport from './FoodQualityLiveViewport';
import WaterLiveViewport from './WaterLiveViewport';
import FoodQualityOledDisplay from './FoodQualityOledDisplay';
import FoodQualityCriticalBanner from './FoodQualityCriticalBanner';
import IoTPrivacyConsentPanel from './IoTPrivacyConsentPanel';
import { isCameraCaptureAllowed } from '../utils/privacyPreferences';
import { QUALITY_LABELS, formatTimeFr, formatTimeShort, CAPTURE_INTERVAL_MINUTES } from '../utils/foodQualityEngine';
import { getDemoWaterTracking } from '../utils/clientDemoData';

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
    lastAlert,
  } = useFoodQualityLive({ enabled: true, demoSimulate: true });

  const [busy, setBusy] = useState(false);
  const [localAlert, setLocalAlert] = useState(null);

  const simulateOnce = async (scenario) => {
    if (!isCameraCaptureAllowed()) return;
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
  const alertInfo = localAlert || lastAlert;
  const cameraAllowed = isCameraCaptureAllowed();
  const waterLive = getDemoWaterTracking('demo-pet-1');

  return (
    <div className="iot-food-quality">
      <IoTPrivacyConsentPanel />

      <header className="iot-fq-hero">
        <div className="iot-fq-hero__content">
          <span className="iot-fq-hero__badge">ESP32-CAM · Afficheur OLED</span>
          <h3>Détection nourriture réelle</h3>
          <p>
            La caméra ESP32 analyse le bac de croquettes toutes les {CAPTURE_INTERVAL_MINUTES} min.
            Le résultat s&apos;affiche immédiatement sur l&apos;afficheur OLED branché (I2C SSD1306).
          </p>
        </div>
      </header>

      <section className="iot-fq-usecase">
        <h4>Fonctionnement</h4>
        <ol>
          <li>Le distributeur est rempli — la caméra capture l&apos;image du bac.</li>
          <li>L&apos;ESP32-CAM détecte la nourriture réelle (couleur, stock, dégradation).</li>
          <li>L&apos;afficheur OLED affiche : Qualité %, Stock %, État (Frais / Alerte).</li>
          <li>Les données sont synchronisées avec PetfoodTN pour consultation à distance.</li>
        </ol>
      </section>

      <FoodQualityCriticalBanner reading={cur} lastAlert={alertInfo} />

      <div className="iot-fq-device">
        <span>📷 {state?.device?.name || 'ESP32-CAM'}</span>
        <span className="iot-fq-status">🟢 {state?.device?.status || 'online'}</span>
        {isLive && (
          <span className="iot-fq-live-pill">
            <span className="iot-fq-live-dot" /> Flux actif
          </span>
        )}
        {socketConnected ? (
          <span className="iot-fq-socket iot-fq-socket--on" title="Socket.IO connecté">
            <Wifi size={13} /> Temps réel
          </span>
        ) : (
          <span className="iot-fq-socket" title="Polling actif">
            <WifiOff size={13} /> Polling
          </span>
        )}
        {state?.mode === 'demo' && <span className="iot-fq-demo">Mode simulation</span>}
      </div>

      <div className="iot-dual-live">
        <div className="iot-dual-live__col">
          <FoodQualityLiveViewport
            reading={cur}
            device={state?.device}
            stream={state?.stream}
            isLive={isLive}
            lastTickAt={lastTickAt}
          />
          <FoodQualityOledDisplay reading={cur} />
        </div>
        <div className="iot-dual-live__col">
          <p className="iot-live-feed__title iot-live-feed__title--water">💧 Eau LIVE</p>
          <WaterLiveViewport water={waterLive} isLive={isLive} lastTickAt={lastTickAt} />
        </div>
      </div>

      <div className={`iot-fq-badge iot-fq-badge--${cur.quality || 'good'}`}>
        <span className="iot-fq-badge-icon">{meta.icon}</span>
        <div>
          <strong>{cur.state || meta.state} — {cur.qualityScore ?? '—'}%</strong>
          <p>Stock {cur.stockLevelPct ?? '—'} % · {cur.recommendedAction || 'Aucune action'}</p>
        </div>
      </div>

      <div className="iot-fq-metrics">
        <div><Thermometer size={14} /> {cur.temperatureC ?? '—'} °C</div>
        <div><Droplets size={14} /> {cur.humidityPct ?? '—'} % HR</div>
        <div><Package size={14} /> Stock {cur.stockLevelPct ?? '—'} %</div>
        <div><Camera size={14} /> Dernière analyse : {formatTimeFr(cur.analyzedAt)}</div>
      </div>

      <div className="iot-fq-actions">
        <button
          type="button"
          className={`iot-fq-btn iot-fq-btn--live${isLive ? ' is-on' : ''}`}
          onClick={() => setIsLive((s) => !s)}
        >
          {isLive ? <Square size={14} /> : <Play size={14} />}
          {isLive ? 'Pause flux caméra' : 'Flux caméra live'}
        </button>
        <button type="button" className="iot-fq-btn" disabled={busy || !cameraAllowed} onClick={() => simulateOnce('good')}>
          Capturer (démo)
        </button>
        <button type="button" className="iot-fq-btn iot-fq-btn--ghost" onClick={reload} disabled={busy}>
          <RefreshCw size={14} /> Actualiser
        </button>
      </div>

      {!cameraAllowed && (
        <p className="iot-privacy-panel__hint">
          Activez la capture ESP32-CAM dans les préférences ci-dessus.
        </p>
      )}

      {chartData.length > 1 && (
        <div className="iot-fq-chart">
          <h4>Historique qualité & stock</h4>
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

      <details className="iot-fq-firmware">
        <summary>Firmware ESP32-CAM + afficheur OLED</summary>
        <p>Firmware : <code>firmware/esp32/PetFoodQualityESP32CAM/</code></p>
        <p>Afficheur : SSD1306 128×64 (I2C SDA=14, SCL=15)</p>
        <pre className="iot-fq-code">{`node scripts/simulate-esp32cam-food-quality.mjs`}</pre>
      </details>
    </div>
  );
};

export default IoTFoodQualityCamPanel;
