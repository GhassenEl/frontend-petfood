import React, { useEffect, useRef, useState } from 'react';
import { Bell, AlertTriangle, X } from 'lucide-react';

const levelStyle = (level) => {
  if (level === 'critical') return { bg: '#fef2f2', border: '#fecaca', color: '#b91c1c', icon: '#dc2626' };
  if (level === 'warning') return { bg: '#fffbeb', border: '#fde68a', color: '#b45309', icon: '#d97706' };
  return { bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8', icon: '#2563eb' };
};

/** Notifications temps réel — niveau bas, appétit anormal, anomalies */
const FeederRealtimeAlerts = ({ alerts = [], realtime = true }) => {
  const seenRef = useRef(new Set());
  const [toastAlert, setToastAlert] = useState(null);

  useEffect(() => {
    if (!realtime || !alerts.length) return;

    const urgent = alerts.find((a) => {
      const key = a.id || `${a.type}-${a.title}`;
      if (seenRef.current.has(key)) return false;
      return a.level === 'critical' || a.level === 'warning';
    });

    if (urgent) {
      const key = urgent.id || `${urgent.type}-${urgent.title}`;
      seenRef.current.add(key);
      setToastAlert(urgent);
      const timer = setTimeout(() => setToastAlert(null), 6000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [alerts, realtime]);

  return (
    <>
      {toastAlert && (
        <div
          style={{
            position: 'fixed',
            top: 16,
            right: 16,
            zIndex: 9999,
            maxWidth: 360,
            padding: '14px 16px',
            borderRadius: 14,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            ...levelStyle(toastAlert.level),
            display: 'flex',
            gap: 10,
            alignItems: 'flex-start',
          }}
        >
          <AlertTriangle size={20} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <strong style={{ fontSize: 14 }}>{toastAlert.title}</strong>
            <p style={{ margin: '4px 0 0', fontSize: 12 }}>{toastAlert.message}</p>
          </div>
          <button type="button" onClick={() => setToastAlert(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>
            <X size={16} />
          </button>
        </div>
      )}

      {!alerts.length ? (
        <div style={{
          padding: '12px 16px',
          borderRadius: 12,
          background: '#ecfdf5',
          border: '1px solid #bbf7d0',
          color: '#166534',
          fontSize: 13,
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <Bell size={16} /> Aucune alerte — distributeur et habitudes normales.
        </div>
      ) : (
        <div style={{ marginBottom: 20 }}>
          <p style={{ margin: '0 0 10px', fontWeight: 800, fontSize: 14, color: '#334155', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bell size={16} color="#dc2626" />
            Notifications temps réel ({alerts.length})
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {alerts.map((a) => {
              const s = levelStyle(a.level);
              return (
                <div
                  key={a.id || a.title}
                  style={{
                    display: 'flex',
                    gap: 12,
                    alignItems: 'flex-start',
                    padding: '12px 14px',
                    borderRadius: 12,
                    background: s.bg,
                    border: `1px solid ${s.border}`,
                    color: s.color,
                  }}
                >
                  <AlertTriangle size={18} color={s.icon} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong style={{ fontSize: 14 }}>{a.title}</strong>
                    <div style={{ fontSize: 12, fontWeight: 400, marginTop: 4, lineHeight: 1.5 }}>{a.message}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default FeederRealtimeAlerts;
