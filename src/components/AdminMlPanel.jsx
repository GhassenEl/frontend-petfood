import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, ArrowRight } from 'lucide-react';
import useAdminMlAgent from '../hooks/useAdminMlAgent';
import { formatDT } from '../utils/formatCurrency';

const AdminMlPanel = ({ compact = false }) => {
  const { data, loading } = useAdminMlAgent();

  if (loading) return <p style={{ color: '#94a3b8', fontSize: 14 }}>Chargement IA…</p>;
  if (!data) return null;

  const rev = data.nextMonthRevenue;

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #faf5ff, #ede9fe)',
        borderRadius: 16,
        padding: compact ? 14 : 20,
        marginBottom: compact ? 16 : 24,
        border: '1px solid #ddd6fe',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
        <Brain size={22} color="#7c3aed" />
        <strong style={{ flex: 1 }}>Agent IA Admin</strong>
        {data.pythonPowered && <span style={badge}>XGBoost</span>}
        {data.groqPowered && <span style={{ ...badge, background: '#ecfdf5', color: '#059669' }}>Groq</span>}
        <Link to="/admin/ml-agent" style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed', textDecoration: 'none' }}>
          Hub IA <ArrowRight size={12} />
        </Link>
      </div>
      {rev && (
        <p style={{ margin: '0 0 8px', fontSize: 14 }}>
          CA prévu : <strong>{formatDT(rev.forecastRevenue ?? 0)}</strong>
        </p>
      )}
      {data.churnHighRisk?.length > 0 && (
        <p style={{ margin: 0, fontSize: 13, color: '#b45309' }}>
          {data.churnHighRisk.length} client(s) à risque churn
        </p>
      )}
    </div>
  );
};

const badge = {
  fontSize: 11,
  fontWeight: 700,
  padding: '4px 10px',
  borderRadius: 999,
  background: '#f3e8ff',
  color: '#7c3aed',
};

export default AdminMlPanel;
