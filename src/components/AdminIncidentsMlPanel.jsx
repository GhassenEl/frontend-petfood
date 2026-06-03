import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, ArrowRight, AlertTriangle } from 'lucide-react';
import useAdminIncidentsMl from '../hooks/useAdminIncidentsMl';

const AdminIncidentsMlPanel = ({ compact = false }) => {
  const { data, loading } = useAdminIncidentsMl();
  const awaiting = data?.platformStats?.awaitingValidation ?? data?.stats?.awaitingValidation ?? 0;

  if (loading) return <p style={{ color: '#94a3b8', fontSize: 14 }}>Agent incidents…</p>;

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
        borderRadius: 16,
        padding: compact ? 14 : 20,
        marginBottom: compact ? 16 : 24,
        border: '1px solid #fecaca',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <Brain size={22} color="#dc2626" />
        <strong style={{ flex: 1 }}>Agent IA incidents</strong>
        {awaiting > 0 && (
          <span style={{ fontSize: 12, fontWeight: 700, color: '#dc2626' }}>
            <AlertTriangle size={12} style={{ verticalAlign: 'middle' }} /> {awaiting} à valider
          </span>
        )}
        <Link to="/admin/incidents-ml" style={{ fontSize: 12, fontWeight: 700, color: '#b91c1c', textDecoration: 'none' }}>
          File validation <ArrowRight size={12} />
        </Link>
      </div>
      {data?.summary && (
        <p style={{ margin: '8px 0 0', fontSize: 13, color: '#7f1d1d' }}>{data.summary}</p>
      )}
    </div>
  );
};

export default AdminIncidentsMlPanel;
