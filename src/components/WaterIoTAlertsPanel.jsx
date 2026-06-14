import React from 'react';
import { AlertTriangle, Bell, Droplets } from 'lucide-react';

const SEVERITY_STYLE = {
  high: { bg: '#fef2f2', border: '#fecaca', color: '#b91c1c', label: 'Critique' },
  medium: { bg: '#fffbeb', border: '#fde68a', color: '#b45309', label: 'Attention' },
  low: { bg: '#f8fafc', border: '#e2e8f0', color: '#475569', label: 'Info' },
};

const TYPE_LABELS = {
  low_hydration: 'Hydratation basse',
  critical_hydration: 'Hydratation critique',
  trend_drop: 'Baisse consommation',
  consumption_spike: 'Pic consommation',
  low_reservoir: 'Réservoir bas',
  filter_expiry: 'Filtre',
  temp_anomaly: 'Température',
  device_offline: 'Hors ligne',
  no_activity: 'Inactivité',
};

const WaterIoTAlertsPanel = ({ alerts = [], summary = null, compact = false, onSelectPet }) => {
  if (!alerts.length) {
    return (
      <div
        style={{
          padding: compact ? 12 : 16,
          borderRadius: 14,
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          marginBottom: compact ? 0 : 16,
        }}
      >
        <p style={{ margin: 0, fontSize: 13, color: '#166534', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Droplets size={16} /> Aucune alerte IoT — hydratation dans les normes.
        </p>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: compact ? 0 : 16 }}>
      {!compact && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
          <h2 style={{ margin: 0, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bell size={18} color="#dc2626" />
            Alertes consommation d&apos;eau IoT
          </h2>
          {summary && (
            <span style={{ fontSize: 12, color: '#64748b' }}>
              {summary.criticalCount > 0 && (
                <strong style={{ color: '#b91c1c' }}>{summary.criticalCount} critique(s)</strong>
              )}
              {summary.criticalCount > 0 && summary.count > summary.criticalCount ? ' · ' : ''}
              {summary.count} alerte(s) active(s)
            </span>
          )}
        </div>
      )}
      <div style={{ display: 'grid', gap: 8 }}>
        {alerts.map((alert, i) => {
          const style = SEVERITY_STYLE[alert.severity] || SEVERITY_STYLE.low;
          return (
            <div
              key={`${alert.petId}-${alert.type}-${i}`}
              style={{
                padding: compact ? 10 : 14,
                borderRadius: 12,
                background: style.bg,
                border: `1px solid ${style.border}`,
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    padding: '3px 8px',
                    borderRadius: 999,
                    background: style.color,
                    color: '#fff',
                  }}
                >
                  {style.label}
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>
                  {TYPE_LABELS[alert.type] || alert.type}
                </span>
                {alert.petName && (
                  <button
                    type="button"
                    onClick={() => onSelectPet?.(alert.petId)}
                    style={{
                      marginLeft: 'auto',
                      border: 'none',
                      background: 'transparent',
                      color: '#0284c7',
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: onSelectPet ? 'pointer' : 'default',
                    }}
                  >
                    {alert.petName}
                  </button>
                )}
              </div>
              <p style={{ margin: 0, fontSize: 13, color: style.color, display: 'flex', gap: 6 }}>
                <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{alert.message}</span>
              </p>
              {alert.action && (
                <p style={{ margin: '6px 0 0 22px', fontSize: 12, color: '#64748b' }}>→ {alert.action}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WaterIoTAlertsPanel;
