import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Thermometer, Droplets, Package, Link2 } from 'lucide-react';
import useFoodQualityLive from '../hooks/useFoodQualityLive';
import { QUALITY_LABELS } from '../utils/foodQualityEngine';

/** Bandeau qualité alimentaire — hub IoT client uniquement. */
const IoTFoodQualityHubStrip = () => {
  const { state, loading, socketConnected } = useFoodQualityLive({ enabled: true, demoSimulate: true });

  const cur = state?.current || {};
  const meta = QUALITY_LABELS[cur.quality] || QUALITY_LABELS.good;
  const score = cur.qualityScore ?? null;
  const stock = cur.stockLevelPct ?? null;

  return (
    <div
      id="qualite-alimentaire"
      className="iot-fq-hub-strip"
      style={{
        marginBottom: 20,
        padding: '18px 20px',
        borderRadius: 18,
        background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 50%, #eff6ff 100%)',
        border: '1px solid #a7f3d0',
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: '1.15rem', fontWeight: 800, color: '#065f46' }}>
            <ShieldCheck size={20} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Qualité alimentaire IoT
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: '#047857' }}>
            Surveillance ESP32-CAM, afficheur OLED et alertes temps réel sur le bac de croquettes.
          </p>
        </div>
        <span style={{
          fontSize: 11,
          fontWeight: 700,
          padding: '6px 12px',
          borderRadius: 999,
          background: socketConnected ? '#dcfce7' : '#f1f5f9',
          color: socketConnected ? '#166534' : '#64748b',
        }}
        >
          {loading ? '…' : socketConnected ? '🟢 Temps réel' : '📡 Polling actif'}
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: 12,
        marginBottom: 14,
      }}
      >
        <Metric icon={<ShieldCheck size={16} />} label="Score qualité" value={loading ? '…' : score != null ? `${score}/100` : '—'} hint={meta.state} color={meta.color} />
        <Metric icon={<Thermometer size={16} />} label="Température" value={cur.temperatureC != null ? `${cur.temperatureC} °C` : '—'} hint="Chaîne du froid" color="#0369a1" />
        <Metric icon={<Droplets size={16} />} label="Humidité" value={cur.humidityPct != null ? `${cur.humidityPct} %` : '—'} hint="Conservation" color="#7c3aed" />
        <Metric icon={<Package size={16} />} label="Stock bac" value={stock != null ? `${stock} %` : '—'} hint="Distributeur" color="#b45309" />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: 12 }}>
        <Link to="/client-traceability" style={linkStyle}>
          <Link2 size={13} style={{ verticalAlign: 'middle' }} /> Traçabilité blockchain
        </Link>
        <Link to="/client-adaptive-nutrition" style={linkStyle}>
          🥗 Analyse nutritionnelle
        </Link>
        <Link to="/pet-feeder" style={linkStyle}>
          🍽️ Distributeur ESP32
        </Link>
      </div>
    </div>
  );
};

const Metric = ({ icon, label, value, hint, color }) => (
  <div style={{
    padding: '12px 14px',
    borderRadius: 14,
    background: 'rgba(255,255,255,0.9)',
    border: '1px solid rgba(0,0,0,0.06)',
  }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#64748b', fontWeight: 700, marginBottom: 4 }}>
      <span style={{ color }}>{icon}</span>
      {label}
    </div>
    <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{value}</div>
    <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>{hint}</div>
  </div>
);

const linkStyle = {
  padding: '8px 14px',
  borderRadius: 10,
  background: 'white',
  border: '1px solid #d1fae5',
  color: '#047857',
  fontWeight: 700,
  textDecoration: 'none',
};

export default IoTFoodQualityHubStrip;
