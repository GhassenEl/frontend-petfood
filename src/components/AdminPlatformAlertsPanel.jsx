import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import useAnalyticsHub from '../hooks/useAnalyticsHub';

const AdminPlatformAlertsPanel = ({ compact = false }) => {
  const { data, loading } = useAnalyticsHub();
  const high = data?.alertCounts?.high ?? 0;
  const total = data?.alertCounts?.total ?? 0;

  if (loading) return <p style={{ fontSize: 13, color: '#94a3b8' }}>Alertes…</p>;
  if (!total) return null;

  return (
    <div
      style={{
        background: high > 0 ? 'linear-gradient(135deg, #fef2f2, #fff7ed)' : 'linear-gradient(135deg, #eff6ff, #f0fdf4)',
        borderRadius: 16,
        padding: compact ? 14 : 18,
        marginBottom: compact ? 16 : 20,
        border: high > 0 ? '1px solid #fecaca' : '1px solid #bfdbfe',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <AlertTriangle size={20} color={high > 0 ? '#dc2626' : '#2563eb'} />
        <strong style={{ flex: 1 }}>
          {total} alerte(s) plateforme
          {high > 0 && ` · ${high} urgente(s)`}
        </strong>
        <Link to="/admin/powerbi" style={{ fontSize: 12, fontWeight: 700, color: '#1d4ed8', textDecoration: 'none' }}>
          Power BI &amp; alertes <ArrowRight size={12} />
        </Link>
      </div>
      {!compact && data?.alerts?.slice(0, 3).map((a) => (
        <p key={a.id} style={{ margin: '8px 0 0', fontSize: 13, color: '#64748b' }}>
          • {a.title}
        </p>
      ))}
    </div>
  );
};

export default AdminPlatformAlertsPanel;
