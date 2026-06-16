import React from 'react';
import { Link } from 'react-router-dom';
import { Wifi, WifiOff, ChevronRight, Battery, BatteryLow } from 'lucide-react';

const TYPE_META = {
  feeder: { icon: '🍽️', color: '#059669', label: 'Distributeur' },
  water: { icon: '💧', color: '#0ea5e9', label: 'Fontaine' },
};

const formatLastSeen = (iso) => {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return 'À l\'instant';
  if (diff < 3600000) return `Il y a ${Math.round(diff / 60000)} min`;
  return `Il y a ${Math.round(diff / 3600000)} h`;
};

const SignalBars = ({ strength = 0 }) => {
  const level = strength >= 75 ? 4 : strength >= 50 ? 3 : strength >= 25 ? 2 : strength > 0 ? 1 : 0;
  return (
    <span className="iot-signal-bar" title={`Signal ${strength}%`} aria-label={`Signal ${strength}%`}>
      {[1, 2, 3, 4].map((n) => (
        <span key={n} className={n <= level ? 'is-on' : ''} style={{ height: 4 + n * 2 }} />
      ))}
    </span>
  );
};

const IoTDeviceCard = ({ device }) => {
  const meta = TYPE_META[device.type] || TYPE_META.feeder;
  const online = device.status === 'online';
  const m = device.metrics || {};

  return (
    <Link
      to={device.route || '/client-iot'}
      className={`iot-device-card${online ? '' : ' is-offline'}`}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span style={{ fontSize: 28 }}>{meta.icon}</span>
          <p style={{ margin: '8px 0 2px', fontSize: 11, fontWeight: 700, color: meta.color, textTransform: 'uppercase' }}>{meta.label}</p>
          <h4 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 800 }}>{device.name}</h4>
          <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Animal : {device.petName}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          {online ? <Wifi size={18} color="#059669" /> : <WifiOff size={18} color="#dc2626" />}
          <p style={{ margin: '4px 0 0', fontSize: 11, fontWeight: 700, color: online ? '#059669' : '#dc2626' }}>
            {online ? 'En ligne' : 'Hors ligne'}
          </p>
        </div>
      </div>
      <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {device.type === 'feeder' && m.reservoirPercent != null && (
          <MetricChip label="Réservoir" value={`${m.reservoirPercent}%`} warn={m.isLowFood} />
        )}
        {device.type === 'feeder' && m.temperature != null && (
          <MetricChip label="Temp." value={`${m.temperature}°C`} />
        )}
        {device.type === 'feeder' && m.todayGrams != null && (
          <MetricChip label="Aujourd'hui" value={`${m.todayGrams} g`} />
        )}
        {device.type === 'water' && m.todayMl != null && (
          <MetricChip label="Hydratation" value={`${m.todayMl}/${m.targetMl || '?'} ml`} warn={m.percentOfTarget < 70} />
        )}
        {device.type === 'water' && m.filterDaysLeft != null && (
          <MetricChip label="Filtre" value={`${m.filterDaysLeft} j`} warn={m.filterDaysLeft < 7} />
        )}
      </div>
      <div className="iot-device-meta-row">
        {device.signalStrength != null && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <SignalBars strength={device.signalStrength} /> {device.signalStrength}%
          </span>
        )}
        {device.batteryPercent != null && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            {device.batteryPercent < 25 ? <BatteryLow size={12} color="#dc2626" /> : <Battery size={12} />}
            {device.batteryPercent}%
          </span>
        )}
        {device.lastSeen && (
          <span>Vu {formatLastSeen(device.lastSeen)}</span>
        )}
      </div>
      <p style={{ margin: '10px 0 0', fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
        Gérer <ChevronRight size={14} />
      </p>
    </Link>
  );
};

const MetricChip = ({ label, value, warn }) => (
  <span style={{
    fontSize: 11,
    fontWeight: 700,
    padding: '4px 8px',
    borderRadius: 6,
    background: warn ? '#fffbeb' : '#f8fafc',
    color: warn ? '#b45309' : '#475569',
    border: `1px solid ${warn ? '#fde68a' : '#e2e8f0'}`,
  }}
  >
    {label}: {value}
  </span>
);

export default IoTDeviceCard;
